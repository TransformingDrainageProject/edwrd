const { checkSchema, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const path = require('path');
const { spawn } = require('child_process');
const tmp = require('tmp');

const { createTaskObject } = require('../models/taskCreator');
const { pythonPath } = require('../config');
const { getFormSchema } = require('../validation/schema');

const Form = mongoose.model('forms');

module.exports = (app) => {
  app.post(
    '/api/form',
    checkSchema(getFormSchema()),
    async (req, res, next) => {
      // validate and sanitize form values and return any errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json(errors);

      // create workspace if one does not exist for this session
      if (!req.session.workspace) {
        req.session.workspace = tmp.dirSync().name;
      }

      const form = new Form(req.body);
      form.save((err) => {
        if (err) return next(err);
        // find wind and rhmin
        const pythonStationFinder = spawn(pythonPath, [
          './src/utils/locate_weather_station.py',
          req.body.location.latitude,
          req.body.location.longitude,
        ]);

        let rhminWnd;
        pythonStationFinder.stdout.on('data', (data) => {
          rhminWnd = JSON.parse(data.toString());
        });

        pythonStationFinder.on('error', (err) => {
          return next(err);
        });

        pythonStationFinder.on('close', async (code) => {
          let inputFile, paramFile;

          if (req.session.inputFile && req.body.userInput) {
            inputFile = path.resolve(
              req.session.workspace,
              req.session.inputFile
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
                rhminWnd
              );
            } catch (err) {
              return next(err);
            }
          }

          if (inputFile && paramFile) {
            const pythonEDWRD = spawn(pythonPath, [
              './src/utils/algorithm/run.py',
              inputFile,
              paramFile,
            ]);

            let dataSpreadsheet = '';
            pythonEDWRD.stdout.on('data', (data) => {
              dataSpreadsheet = data.toString().trim();
            });

            pythonEDWRD.on('error', (err) => {
              return next(err);
            });

            pythonEDWRD.on('close', (code) => {
              return res.download(dataSpreadsheet);
            });
          } else {
            return res.sendStatus(500);
          }
        });
      });
    }
  );
};
