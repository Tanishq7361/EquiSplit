import apiClient from './apiClient';

const groupsApi = {
  createGroup:  (data)              => apiClient.post('/groups', data),
  getGroups:    ()                  => apiClient.get('/groups'),
  getGroup:     (groupId)           => apiClient.get(`/groups/${groupId}`),
  addMember:    (groupId, data)     => apiClient.post(`/groups/${groupId}/members`, data),
  getMembers:   (groupId)           => apiClient.get(`/groups/${groupId}/members`),
  removeMember: (groupId, userId)   => apiClient.delete( `/groups/${groupId}/members/${userId}`),
  deleteGroup:  (groupId)           => apiClient.delete(`/groups/${groupId}`),
};


export default groupsApi;
