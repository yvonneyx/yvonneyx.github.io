import React, { useState, useMemo, useEffect, useRef } from 'react';
// import PropTypes from 'prop-types';
import {
  Table,
  Tag,
  Select,
  Input,
  Button,
  Typography,
  Space,
  Popconfirm,
  message,
  Spin,
} from 'antd';
import { ModalWrapper } from '../common';
import {
  UserDeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  AlignLeftOutlined,
} from '@ant-design/icons';
import { roles, showDate, antIcon } from '../../common/constants';
import { serverUrl } from '../../common/globalConfig';
import {
  GetColumnSearchProps as getColumnSearchProps,
  GetColumnFilterProps as getColumnFilterProps,
} from '../common';
import { useDeleteUser, useGetUsersList } from './redux/hooks';
import _ from 'lodash';

const { Option } = Select;
const { Search } = Input;

export default function UserMngPage() {
  const [selectedRole, setSelectedRole] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentLine, setCurrentLine] = useState({});
  const { deleteUser, deleteUserPending } = useDeleteUser();
  // const { usersList, getUsersList, getUsersListPending, getUsersListError } = useGetUsersList();
  const [version, setVersion] = useState('');
  const searchInput = useRef();
  const [usersList, setUsersList] = useState(null);
  const [getUsersListPending, setGetUsersListPending] = useState(false);
  const [getUsersListError, setGetUsersListError] = useState(false);

  useEffect(() => {
    // getUsersList();
    setGetUsersListPending(true);
    setGetUsersListError(false);
    fetch(`${serverUrl}/User/all`)
      .then(res => res.json())
      .then(
        res => {
          setUsersList(res.ext.users);
          setGetUsersListPending(false);
        },
        err => {
          setGetUsersListPending(false);
          setGetUsersListError(true);
        },
      );
  }, [version]);

  const handleVersionUpdate = () => {
    setVersion(new Date());
  };

  const handleRoleChange = value => {
    setSelectedRole(value);
  };

  const onSearch = value => {
    setSearchKey(value);
  };

  const usersToShow = useMemo(() => {
    if (_.isEmpty(usersList)) {
      return null;
    }
    let temp = usersList && usersList.filter(data => data.isDeleted === 'N');
    if (selectedRole && selectedRole !== 'Tous') {
      temp = temp.filter(data => {
        return data.userType === roles.indexOf(selectedRole);
      });
    }
    if (searchKey) {
      temp = temp.filter(data => _.includes(_.lowerCase(data.userNom), _.lowerCase(searchKey)));
    }
    return temp;
  }, [usersList, searchKey, selectedRole]);

  async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  const deleteConfirm = rc => {
    // deleteUser({
    postData(`${serverUrl}/User/remove`, { userId: rc.userId })
      .then(() => {
        handleVersionUpdate();
        message.success('Supprimé avec succès', 5);
      })
      .catch(() => {
        message.error('Echec de la suppression', 5);
      });
  };

  const onResetClick = () => {
    setSearchKey('');
    setSelectedRole('');
    if (searchInput.current) searchInput.current.state.value = '';
  };

  const onModalVisibleChange = visible => {
    setIsModalVisible(visible);
  };

  const roleFilterOptions = roles.slice(0, 3).map(role => {
    return {
      text: role,
      value: roles.indexOf(role),
    };
  });

  const columns = [
    {
      title: 'UID',
      dataIndex: 'userId',
      key: 'userId',
      width: 40,
      sorter: (a, b) => a.userId - b.userId,
      defaultSortOrder: 'ascend',
    },
    {
      title: "Nom d'utilisateur",
      dataIndex: 'userNom',
      key: 'userNom',
      width: 180,
      ...getColumnSearchProps('userNom'),
    },
    {
      title: 'Rôle',
      dataIndex: 'userType',
      key: 'userType',
      width: 180,
      render: role => {
        let color = role === 0 ? '#5E454B' : role === 1 ? '#5B8A72' : '#D57E7E';
        return (
          <div className={`usertype-tag usertype-tag-${role}`} color={color}>
            {roles[role]}
          </div>
        );
      },
      ...getColumnFilterProps('userType', roleFilterOptions),
    },
    {
      title: 'Heure mise à jour',
      dataIndex: 'updatedTime',
      key: 'updatedTime',
      width: 180,
      render: time => showDate(time),
      sorter: (a, b) => a.updatedTime > b.updatedTime,
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
                title="Êtes-vous sûr de supprimer cet utilisateur?"
                onConfirm={() => {
                  deleteConfirm(record);
                }}
                okText="Oui, je confirme"
                cancelText="Non"
              >
                <UserDeleteOutlined />
              </Popconfirm>
            </Typography.Link>
            {record.userType === 1 && (
              <Typography.Link href={`/admin/gestion-des-infirmieres/${record.userId}`}>
                <AlignLeftOutlined />
              </Typography.Link>
            )}
            {record.userType === 2 && (
              <Typography.Link href={`/admin/gestion-des-coordinateurs/${record.userId}`}>
                <AlignLeftOutlined />
              </Typography.Link>
            )}
          </Space>
        );
      },
    },
  ];

  const paginationProps = {
    pageSize: 8,
    total: usersToShow && usersToShow.length,
  };

  return (
    <div className="admin-user-mng-page">
      <div className="admin-user-mng-page-header">
        <h1>Utilisateurs</h1>
        <Button
          type="primary"
          onClick={() => {
            setIsModalVisible(true);
            setCurrentLine({});
          }}
        >
          Créer un nouvel utilisateur
        </Button>
      </div>
      <ModalWrapper
        name="user"
        visible={isModalVisible}
        onModalVisibleChange={onModalVisibleChange}
        data={currentLine}
        handleVersionUpdate={handleVersionUpdate}
      />

      <div className="admin-user-mng-page-table-header">
        <div className="admin-user-mng-page-table-header-left">
          <Select className="role-selector" onChange={handleRoleChange} placeholder="Choisir rôle">
            {roles.map(role => {
              return (
                <Option value={role} key={roles.indexOf(role)}>
                  {role}
                </Option>
              );
            })}
          </Select>
          <Search
            className="search-bar"
            placeholder="Rechercher par nom d'utilisateur.."
            onSearch={onSearch}
            enterButton
            ref={searchInput}
          />
        </div>
        <div className="admin-user-mng-page-table-header-right">
          <Button className="reset-btn" onClick={onResetClick}>
            Réinitialiser
          </Button>
        </div>
      </div>
      <Spin
        tip="Chargement en cours..."
        spinning={getUsersListPending || deleteUserPending}
        indicator={antIcon}
      >
        <Table
          size="middle"
          rowKey="userId"
          columns={columns}
          dataSource={usersToShow}
          pagination={paginationProps}
          rowKey={record => record.userId}
        />
        <div className="admin-user-mng-page-footer">
          {!getUsersListError ? (
            _.isEmpty(usersToShow) ? (
              'Pas de résultat répond aux critères de recherche'
            ) : usersToShow.length === 1 ? (
              'Seul 1 utilisateur répond répond aux critères de recherche'
            ) : (
              `${usersToShow.length} utilisateurs répondent aux critères de recherche`
            )
          ) : (
            <div className="error">Échec du chargement des données</div>
          )}
        </div>
      </Spin>
    </div>
  );
}

UserMngPage.propTypes = {};
UserMngPage.defaultProps = {};
