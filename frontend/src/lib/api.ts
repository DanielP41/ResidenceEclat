const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Algo salió mal');
    }

    return data;
}

export const roomsApi = {
    getAll: (residence?: string) => {
        const query = residence ? `?residence=${residence}` : '';
        return fetchApi(`/rooms${query}`);
    },
    getById: (id: string) => fetchApi(`/rooms/${id}`),
    checkAvailability: (params: { checkIn: string; checkOut: string; capacity?: number }) => {
        const query = new URLSearchParams(params as any).toString();
        return fetchApi(`/rooms/availability?${query}`);
    },
};

export const bookingsApi = {
    create: (data: any) => fetchApi('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

export const statsApi = {
    getOccupancy: (residence?: string) => {
        const query = residence ? `?residence=${residence}` : '';
        return fetchApi(`/stats/occupancy${query}`);
    },
};

export const observationsApi = {
    get: (residence: string) => fetchApi(`/observations/${residence}`),
    save: (residence: string, content: string) =>
        fetchApi(`/observations/${residence}`, {
            method: 'PUT',
            body: JSON.stringify({ content }),
        }),
};
