const API_BASE = '/api';

const getAuthHeaders = (authUserId) => {
  let id = authUserId;
  if (!id && typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('cuec_current_user');
      if (saved) {
        id = JSON.parse(saved)?.id;
      }
    } catch {
      // ignore storage read error
    }
  }
  return id ? { 'x-user-id': id } : {};
};

export const api = {
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },

  async getClubs() {
    const res = await fetch(`${API_BASE}/clubs`);
    return res.json();
  },

  async updateClub(id, data, authUserId) {
    const res = await fetch(`${API_BASE}/clubs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(authUserId)
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getEvents(params) {
    const query = new URLSearchParams();
    if (params?.clubId && params.clubId !== 'all') query.set('clubId', params.clubId);
    if (params?.wingSlug && params.wingSlug !== 'all') query.set('wingSlug', params.wingSlug);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${API_BASE}/events?${query.toString()}`);
    return res.json();
  },

  async getEvent(id) {
    const res = await fetch(`${API_BASE}/events/${id}`);
    return res.json();
  },

  async createEvent(eventData, authUserId) {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(authUserId)
      },
      body: JSON.stringify(eventData)
    });
    return res.json();
  },

  async updateEvent(id, eventData, authUserId) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(authUserId)
      },
      body: JSON.stringify(eventData)
    });
    return res.json();
  },

  async deleteEvent(id, authUserId) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(authUserId)
      }
    });
    return res.json();
  },

  async registerForEvent(eventId, studentData) {
    const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(studentData.userId)
      },
      body: JSON.stringify(studentData)
    });
    return res.json();
  },

  async getAnnouncements(params) {
    const query = new URLSearchParams();
    if (params?.clubId && params.clubId !== 'all') query.set('clubId', params.clubId);
    if (params?.priority && params.priority !== 'all') query.set('priority', params.priority);

    const res = await fetch(`${API_BASE}/announcements?${query.toString()}`);
    return res.json();
  },

  async createAnnouncement(data, authUserId) {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(authUserId)
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateAnnouncement(id, data, authUserId) {
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(authUserId)
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteAnnouncement(id, authUserId) {
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(authUserId)
      }
    });
    return res.json();
  },

  async getGallery(params) {
    const query = new URLSearchParams();
    if (params?.clubId && params.clubId !== 'all') query.set('clubId', params.clubId);
    if (params?.wingSlug && params.wingSlug !== 'all') query.set('wingSlug', params.wingSlug);

    const res = await fetch(`${API_BASE}/gallery?${query.toString()}`);
    return res.json();
  },

  async createGalleryItem(data, authUserId) {
    const res = await fetch(`${API_BASE}/gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(authUserId)
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async likeGalleryItem(id) {
    const res = await fetch(`${API_BASE}/gallery/${id}/like`, { method: 'POST' });
    return res.json();
  },

  async updateGalleryItem(id, data, authUserId) {
    const res = await fetch(`${API_BASE}/gallery/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(authUserId)
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteGalleryItem(id, authUserId) {
    const res = await fetch(`${API_BASE}/gallery/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(authUserId)
      }
    });
    return res.json();
  },

  async getMemberRequests(authUserId) {
    const res = await fetch(`${API_BASE}/member-requests`, {
      headers: {
        ...getAuthHeaders(authUserId)
      }
    });
    return res.json();
  },

  async submitMemberRequest(data, authUserId) {
    const res = await fetch(`${API_BASE}/member-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(authUserId)
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async approveMemberRequest(id, authUserId) {
    const res = await fetch(`${API_BASE}/member-requests/${id}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(authUserId)
      }
    });
    return res.json();
  },

  async rejectMemberRequest(id, authUserId) {
    const res = await fetch(`${API_BASE}/member-requests/${id}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(authUserId)
      }
    });
    return res.json();
  },

  async getMembers(clubId, authUserId) {
    const query = new URLSearchParams();
    if (clubId && clubId !== 'all') query.set('clubId', clubId);
    const res = await fetch(`${API_BASE}/members?${query.toString()}`, {
      headers: {
        ...getAuthHeaders(authUserId)
      }
    });
    return res.json();
  },

  async removeMember(userId, authUserId) {
    const res = await fetch(`${API_BASE}/members/${userId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(authUserId)
      }
    });
    return res.json();
  },

  async getApplications(authUserId) {
    const res = await fetch(`${API_BASE}/applications`, {
      headers: {
        ...getAuthHeaders(authUserId)
      }
    });
    return res.json();
  },

  async submitApplication(data, authUserId) {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(authUserId)
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async approveApplication(id, adminNotes, authUserId) {
    const res = await fetch(`${API_BASE}/applications/${id}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(authUserId)
      },
      body: JSON.stringify({ adminNotes })
    });
    return res.json();
  },

  async rejectApplication(id, adminNotes, authUserId) {
    const res = await fetch(`${API_BASE}/applications/${id}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(authUserId)
      },
      body: JSON.stringify({ adminNotes })
    });
    return res.json();
  },

  async deleteApplication(id, authUserId) {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(authUserId)
      }
    });
    return res.json();
  },

  async getUsers(authUserId) {
    const res = await fetch(`${API_BASE}/users`, {
      headers: {
        ...getAuthHeaders(authUserId)
      }
    });
    return res.json();
  },

  async createUser(userData, authUserId) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(authUserId)
      },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  async updateUser(id, userData, authUserId) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(authUserId)
      },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  async deleteUser(id, authUserId) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(authUserId)
      }
    });
    return res.json();
  },

  async login(email) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
