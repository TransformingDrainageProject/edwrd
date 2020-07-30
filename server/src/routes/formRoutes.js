const { checkSchema, validationResult } = require('express-validator');
const createError = require('http-errors');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const { PythonShell } = require('python-shell');
const { spawn } = require('child_process');
const tmp = require('tmp');

const { createTaskObject } = require('../models/taskCreator');
const dailyStations = require('../utils/daily_stations.json');
const { getFormSchema } = require('../validation/schema');
const { pythonPath } = require('../config');
const winston = require('../config/winston');
const { create } = require('../models/Task');

const Form = mongoose.model('forms');

module.exports = (app, io) => {
  app.post(
    '/api/form',
    checkSchema(getFormSchema()),
    async (req, res, next) => {
      io.emit('test', { msg: '/api/form' });
      // validate and sanitize form values and return any errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json(errors);

      // create workspace if one does not exist for this session
      if (!req.session.workspace || !fs.existsSync(req.session.workspace)) {
        req.session.workspace = tmp.dirSync().name;
      }

      // check for file uploads
      if (req.body.userInput === 'true' && !req.session.inputFile) {
        return next(createError(400, 'Must upload file with daily values'));
      }

      const form = new Form(req.body);
      form.save((err) => {
        if (err) return next(err);
        // find wind and rhmin
        const pythonStationFinder = spawn(pythonPath, [
          './src/utils/locate_nearest_station_data.py',
          form.location.latitude,
          form.location.longitude,
          form.userInput ? 1 : 0,
          req.body.unitType,
        ]);

        let stationData;
        pythonStationFinder.stdout.on('data', (data) => {
          stationData = JSON.parse(data.toString().trim());
        });

        pythonStationFinder.on('error', (err) => {
          return next(err);
        });

        pythonStationFinder.on('close', async (code) => {
          let inputFile, paramFile;

          if (req.session.inputFile && form.userInput) {
            inputFile = path.resolve(
              req.session.workspace,
              req.session.inputFile
            );
          } else if (!form.userInput && form.userSelectedStation > -1) {
            const stationFile =
              dailyStations.stations[form.userSelectedStation].file;
            inputFile = path.resolve(req.session.workspace, stationFile);
            fs.copyFileSync(
              path.resolve('src', 'utils', 'daily_stations', stationFile),
              inputFile
            );
          } else {
            inputFile = path.resolve(req.session.workspace, stationData.input);
            fs.copyFileSync(
              path.resolve('src', 'utils', 'daily_stations', stationData.input),
              inputFile
            );
          }
          if (req.session.paramFile && req.body.userParam) {
            paramFile = path.resolve(
              req.session.workspace,
              req.session.paramFile
            );
          } else {
            // create param file
            try {
              paramFile = await createTaskObject(
                req.session.workspace,
                req.body,
                stationData.param
              );
            } catch (err) {
              return next(err);
            }
          }

          if (inputFile && paramFile) {
            const startTime = process.hrtime();

            // while in json mode, python-shell library will throw an internal
            // error when the python script has an exception. work around is to
            // convert the stderr message to valid json (last line in options).
            const options = {
              mode: 'json',
              pythonPath: pythonPath,
              pythonOptions: ['-u'],
              scriptPath: './src/utils/algorithm',
              args: [inputFile, paramFile, req.body.unitType],
              stderrParser: (line) => JSON.stringify(line),
            };

            const pyshell = new PythonShell('run.py', options);

            let results = undefined;
            pyshell.on('message', (message) => {
              if ('msg' in message) {
                io.emit('processing', message);
              }
              if ('data' in message) {
                results = message.data;
              }
            });

            pyshell.on('error', (err) => {
              winston.error(err.stack);
            });

            pyshell.end((err, code, signal) => {
              const runtime = process.hrtime(startTime)[0];

              if (err || code !== 0) {
                if (err) {
                  winston.error(err);
                  io.emit('error', {
                    msg: err.stack.split('\n')[0].split(':')[2].trim(),
                  });
                } else {
                  winston.error('Unexpected error has occurred');
                  io.emit('error', { msg: 'Unexpected error has occurred' });
                }
              } else {
                winston.info(`edwrd took ${runtime} seconds`);
                io.emit('processing', {
                  msg: `Task completed in ${runtime} seconds.`,
                });
                io.emit('chartDataReady', results);
              }
            });

            return res.send(
              'Please do not close this tab. Your request is currently processing.'
            );
          } else {
            return res.sendStatus(500);
          }
        });
      });
    }
  );
};
