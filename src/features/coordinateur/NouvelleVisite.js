import React, { useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
import { OrdDetailTable } from '../home';
import _ from 'lodash';
import { DatePicker, Tag, Button, notification, Spin, Typography } from 'antd';
import { useFindInfirmieresByDptId } from './redux/hooks';
import { useAddVisite, useUpdateOrdonnance } from '../home/redux/hooks';
import { antIcon } from '../../common/constants';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

export default function NouvelleVisite() {
  const [cookies, setCookie] = useCookies(['UID', 'UCID', 'UNAME', 'UROLE']);
  const [selectedOrd, setSelectedOrd] = useState({});
  const [visiteDate, setVisiteDate] = useState(null);
  const [selectedInfirm, setSelectedInfirm] = useState('');
  const [newVisiteId, setNewVisiteId] = useState('1');
  const [version, setVersion] = useState(null);
  const [reset, setReset] = useState(false);
  const {
    infirmieres,
    findInfirmieresByDptId,
    findInfirmieresByDptIdPending,
    findInfirmieresByDptIdError,
  } = useFindInfirmieresByDptId();
  const { addVisite, addVisitePending, addVisiteError } = useAddVisite();
  const {
    updateOrdonnance,
    updateOrdonnancePending,
    updateOrdonnanceError,
  } = useUpdateOrdonnance();

  useEffect(() => {
    !_.isEmpty(selectedOrd) &&
      findInfirmieresByDptId({
        departementId: selectedOrd[0].departementId,
      });
  }, [findInfirmieresByDptId, selectedOrd]);

  const handleSelectedOrdChange = values => {
    setSelectedOrd(values);
  };

  const handleInfirmChange = (tag, checked) => {
    checked ? setSelectedInfirm(tag.infirmiereId) : setSelectedInfirm('');
  };

  const onDateChange = (value, dateString) => {
    setVisiteDate(value);
  };

  const triggerAddVsEvent = () => {
    addVisite({
      ordonnanceId: selectedOrd[0].ordonnanceId,
      visiteDate: new Date(visiteDate),
      visiteHeureDebut: new Date(visiteDate),
      visiteEtat: 0,
      coordinateurId: cookies.UCID,
      patientId: selectedOrd[0].patientId,
      infirmiereId: selectedInfirm,
      modificateurRecent: cookies.UID,
    }).then(res => {
      setNewVisiteId(res.data.ext.newVisite.visiteId);
      setReset(true);
      updateOrdonnance({
        ...selectedOrd[0],
        ordonnanceEtat: 1,
      }).then(() => {
        setVersion(new Date());
      });
    });
  };

  return (
    <div className="coordinateur-nouvelle-visite">
      <div className="coordinateur-nouvelle-visite-header">
        <h1>Organiser une nouvelle visite</h1>
      </div>
      <h2>Ordonnance à traiter</h2>
      <OrdDetailTable
        handleSelectedOrdChange={handleSelectedOrdChange}
        needRadio={true}
        showNotStarted={true}
        defaultpageSize={5}
        version={version}
        needShowDtl={false}
      />
      <h2>
        Infirmières dans les services correspondants de l'examen médical: [
        {!_.isEmpty(selectedOrd) ? selectedOrd[0].examenMedicalNom : 'Sélectionnez une ordonnance'}]
      </h2>

      <Spin
        tip="Chargement en cours..."
        spinning={findInfirmieresByDptIdPending}
        indicator={antIcon}
      >
        <div className="infirmiere-part classic-part">
          <div className="infirmiere-part-title">
            Les infirmières suivantes peuvent prendre des dispositions:
          </div>
          {!_.isEmpty(infirmieres) ? (
            <div>
              <div className="infirmiere-part-container">
                {infirmieres.map(infirm => (
                  <div>
                    <Tag.CheckableTag
                      className="infirmiere-part-one"
                      key={infirm.infirmiereId}
                      checked={selectedInfirm === infirm.infirmiereId}
                      onChange={checked => handleInfirmChange(infirm, checked)}
                    >
                      {infirm.infirmiereNom}
                    </Tag.CheckableTag>
                    <span className="infirm-status-container">
                      <span className="square-fit-content red">{infirm.pasCommence}</span>
                      <span className="square-fit-content yellow">{infirm.enCour}</span>
                      <span className="square-fit-content green">{infirm.fin}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="infirmiere-part-tip">
                * Charge de travail actuelle de l'infirmière - En attente: <span className="square red" />
                En-cours: <span className="square yellow" />
                Finis: <span className="square green" />
              </div>
            </div>
          ) : (
            <div className="aucune-tip">[Aucune infirmière ne peut être choisie]</div>
          )}
        </div>
      </Spin>

      <h2>Date et heure de la première visite</h2>
      <div className="datepicker-part classic-part">
        <DatePicker showTime onChange={onDateChange} bordered={false} showToday={false} />
      </div>

      <Button
        type="primary"
        className="coordinateur-nouvelle-visite-confirm-btn slide-btn"
        onClick={triggerAddVsEvent}
        disabled={addVisitePending || reset}
      >
        {!addVisitePending ? 'Confirmer et créer une nouvelle visite' : 'En cours'}
      </Button>

      {reset && (
        <div>
          En a créé un avec succès.{' '}
          <a href={`/coordinateur/gestion-des-visites/${newVisiteId}`}>
            Cliquez ici pour accéder à la page de détails
          </a>{' '}
          ou{' '}
          <Button
            onClick={() => {
              setReset(false);
            }}
            className="reset-btn"
          >
            continuez à créer une nouvelle visite
          </Button>
          .
        </div>
      )}
    </div>
  );
}

NouvelleVisite.propTypes = {};
NouvelleVisite.defaultProps = {};
