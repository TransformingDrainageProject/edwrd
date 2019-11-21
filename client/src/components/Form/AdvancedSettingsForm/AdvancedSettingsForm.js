import React, { useState } from 'react';
import { Field } from 'formik';
import {
  Button,
  Col,
  Container,
  Modal,
  ModalBody,
  ModalHeader,
  Row
} from 'reactstrap';
import PropTypes from 'prop-types';

import AdvancedLabel from './AdvancedLabel';
import AdvancedSeasonTable from './AdvancedSeasonTable';

const AdvancedSettings = props => {
  const { unitType } = props;
  const [modal, toggleModal] = useState(props.open ? props.open : false);

  const toggle = () => {
    toggleModal(!modal);
  };

  return (
    <div>
      <Button
        style={{ backgroundColor: '#edb229', height: '75px' }}
        size="lg"
        onClick={toggle}
      >
        <strong>Open Advanced Settings</strong>
      </Button>
      <Modal isOpen={modal} toggle={toggle} size="xl">
        <ModalHeader toggle={toggle}>Advanced Settings</ModalHeader>
        <ModalBody>
          <Container>
            <Row className="mb-3" style={{ border: '1px solid #c8ced5' }}>
              <Col>
                <Row>
                  <Col>
                    <h4>
                      <u>Reservoir Settings</u>
                    </h4>
                  </Col>
                </Row>
                <Row>
                  <Col md="4">
                    <AdvancedLabel
                      name="rseep"
                      text="Reservoir seepage rate"
                      unit="inchDay"
                      unitType={unitType}
                    >
                      <Field
                        className="form-control"
                        type="number"
                        name="rseep"
                        step="0.01"
                      />
                    </AdvancedLabel>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className="mb-3" style={{ border: '1px solid #c8ced5' }}>
              <Col>
                <Row>
                  <Col>
                    <h4>
                      <u>Soil Profile Settings</u>
                    </h4>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <AdvancedLabel
                      name="zrfc"
                      text="Soil profile field capacity"
                    >
                      <Field
                        className="form-control"
                        type="number"
                        name="zrfc"
                        step="0.01"
                      />
                    </AdvancedLabel>
                  </Col>
                  <Col>
                    <AdvancedLabel
                      name="zrwp"
                      text="Soil profile wilting point"
                    >
                      <Field
                        className="form-control"
                        type="number"
                        name="zrwp"
                        step="0.01"
                      />
                    </AdvancedLabel>
                  </Col>
                  <Col>
                    <AdvancedLabel
                      name="ze"
                      text="Depth of soil evaporation layer"
                      unit="feet"
                      unitType={unitType}
                    >
                      <Field
                        className="form-control"
                        type="number"
                        name="ze"
                        step="0.01"
                      />
                    </AdvancedLabel>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <AdvancedLabel
                      name="zefc"
                      text="Soil surface field capacity"
                    >
                      <Field
                        className="form-control"
                        type="number"
                        name="zefc"
                        step="0.01"
                      />
                    </AdvancedLabel>
                  </Col>
                  <Col>
                    <AdvancedLabel
                      name="zewp"
                      text="Soil surface wilting point"
                    >
                      <Field
                        className="form-control"
                        type="number"
                        name="zewp"
                        step="0.01"
                      />
                    </AdvancedLabel>
                  </Col>
                  <Col>
                    <AdvancedLabel
                      name="rew"
                      text="Readily evaporable water"
                      unit="inches"
                      unitType={unitType}
                    >
                      <Field
                        className="form-control"
                        type="number"
                        name="rew"
                        step="0.1"
                      />
                    </AdvancedLabel>
                  </Col>
                </Row>
              </Col>
            </Row>
            <AdvancedSeasonTable />
            <Row className="mb-3" style={{ border: '1px solid #c8ced5' }}>
              <Col>
                <AdvancedLabel
                  name="dep29"
                  text="Upload .txt file with your own custom input settings"
                >
                  <input className="form-control" name="dep29" type="file" />
                </AdvancedLabel>
                <a href="#">Download template input file</a>
              </Col>
            </Row>
          </Container>
        </ModalBody>
      </Modal>
    </div>
  );
};

AdvancedSettings.propTypes = {
  unitType: PropTypes.string
};

export default AdvancedSettings;
