import React, { useEffect, useState, useMemo, useRef } from 'react';
// import PropTypes from 'prop-types';
import { Table, Input, Button, Typography, Space, Popconfirm, message, Spin } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  SearchOutlined,
} from '@ant-design/icons';
import _ from 'lodash';
import { showDate, antIcon } from '../../common/constants';
import ModalWrapper from '../common/ModalWrapper';
import { useGetExamensList, useDeleteExamen, useGetDptsList } from './redux/hooks';
import Highlighter from 'react-highlight-words';
import {
  GetColumnSearchProps as getColumnSearchProps,
  GetColumnFilterProps as getColumnFilterProps,
} from '../common';

const { Search } = Input;

export default function ExamenMngPage(props) {
  const [searchKey, setSearchKey] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentLine, setCurrentLine] = useState({});
  const [version, setVersion] = useState('');
  const {
    examensList,
    getExamensList,
    getExamensListPending,
    getExamensListError,
  } = useGetExamensList();
  const { deleteExamen } = useDeleteExamen();
  const { dptsList, getDptsList, getDptsListPending } = useGetDptsList();
  const searchInput = useRef();

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const nestedSearchInput = useRef(null);

  useEffect(() => {
    getExamensList();
  }, [getExamensList, version]);

  useEffect(() => {
    if (_.isEmpty(dptsList)) {
      getDptsList();
    }
  }, [getDptsList, dptsList]);

  const emToShow = useMemo(() => {
    let temp;
    if (_.isEmpty(examensList)) return null;
    temp = examensList.filter(data => data.isDeleted === 'N');
    if (!_.isEmpty(searchKey)) {
      temp = temp.filter(data =>
        _.includes(_.lowerCase(data.examenMedicalNom), _.lowerCase(searchKey)),
      );
    }
    return temp;
  }, [examensList, searchKey]);

  const handleVersionUpdate = () => {
    setVersion(new Date());
  };

  const onSearch = value => {
    setSearchKey(value);
  };

  const deleteConfirm = rc => {
    deleteExamen({
      examenMedicalId: rc.examenMedicalId,
    })
      .then(() => {
        handleVersionUpdate();
        message.success('Supprimé avec succès', 5);
      })
      .catch(() => {
        message.error('Echec de la suppression', 5);
      });
  };

  const onModalVisibleChange = visible => {
    setIsModalVisible(visible);
  };

  const filterOptions =
    !_.isEmpty(dptsList) &&
    dptsList.map(dpt => {
      return {
        text: dpt.departementNom,
        value: dpt.departementNom,
      };
    });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('');
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'examenMedicalId',
      key: 'examenMedicalId',
      width: 35,
    },
    {
      title: "Nom d'examen medical",
      dataIndex: 'examenMedicalNom',
      key: 'examenMedicalNom',
      ellipsis: true,
      ...getColumnSearchProps('examenMedicalNom'),
    },
    {
      title: 'Département concerné',
      dataIndex: 'departementNom',
      key: 'departementNom',
      ...getColumnFilterProps('departementNom', filterOptions),
    },
    {
      title: 'Prix',
      dataIndex: 'examenMedicalPrix',
      key: 'examenMedicalPrix',
      width: 100,
      render: text => <span>{text}€</span>,
    },
    {
      title: 'Heure mise à jour',
      dataIndex: 'updatedTime',
      key: 'updatedTime',
      width: 180,
      render: time => showDate(time),
    },
    {
      title: 'Opération',
      dataIndex: 'operation',
      key: 'operation',
      width: 120,
      render: (text, record) => {
        return (
          <Space size="middle">
            <Typography.Link
              onClick={() => {
                setIsModalVisible(true);
                setCurrentLine(record);
              }}
            >
              <EditOutlined />
            </Typography.Link>
            <Typography.Link>
              <Popconfirm
                icon={<ExclamationCircleFilled style={{ color: 'var(--first-color)' }} />}
                title="Êtes-vous sûr de supprimer cet examen medical?"
                onConfirm={() => {
                  deleteConfirm(record);
                }}
                okText="Oui, je confirme"
                cancelText="Non"
                placement="left"
              >
                <DeleteOutlined />
              </Popconfirm>
            </Typography.Link>
          </Space>
        );
      },
    },
  ];

  const paginationProps = {
    pageSize: 8,
    total: (emToShow && emToShow.length) || 0,
  };

  return (
    <div className="admin-examen-mng-page">
      <div className="admin-examen-mng-page-header">
        <h1>Examens médicaux</h1>
        <Button
          type="primary"
          onClick={() => {
            setIsModalVisible(true);
            setCurrentLine({});
          }}
        >
          Ajouter un nouvel examen medical
        </Button>
      </div>
      <ModalWrapper
        name="examen"
        visible={isModalVisible}
        onModalVisibleChange={onModalVisibleChange}
        data={currentLine}
        handleVersionUpdate={handleVersionUpdate}
        dptsList={dptsList}
      />
      <Spin tip="Chargement en cours..." spinning={getExamensListPending} indicator={antIcon}>
        <Table
          size="middle"
          rowKey="examenMedicalId"
          columns={columns}
          dataSource={emToShow}
          pagination={paginationProps}
        />
        <div className="admin-examen-mng-page-footer">
          {!getExamensListError ? (
            _.isEmpty(emToShow) ? (
              'Pas de résultat répond aux critères de recherche'
            ) : emToShow.length === 1 ? (
              'Seul 1 examen medical répond aux critères de recherche'
            ) : (
              `${emToShow.length} examens medicaux répondent aux critères de recherche`
            )
          ) : (
            <div className="error">Échec du chargement des données</div>
          )}
        </div>
      </Spin>
    </div>
  );
}

ExamenMngPage.propTypes = {};
ExamenMngPage.defaultProps = {};
