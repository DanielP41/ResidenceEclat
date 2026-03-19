import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function handleExpiredSession() {
    localStorage.removeItem('user');
    toast.error('Tu sesión expiró. Por favor iniciá sesión nuevamente.');
    setTimeout(() => {
        window.location.href = '/admin/login';
    }, 1500);
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const data = await response.json();

    if (response.status === 401) {
        const isAdminRoute = typeof window !== 'undefined' &&
            window.location.pathname.startsWith('/admin') &&
            window.location.pathname !== '/admin/login';
        if (isAdminRoute) {
            handleExpiredSession();
            return;
        }
    }

    if (!response.ok) {
        const error: any = new Error(data.message || 'Algo salió mal');
        error.details = data.errors || null;
        throw error;
    }

    return data;
}

export const roomsApi = {
    getAll: (residenceId?: number) => {
        const query = residenceId ? `?residenceId=${residenceId}` : '';
        return fetchApi(`/rooms${query}`);
    },

    getById: (id: string) => fetchApi(`/rooms/${id}`),
    create: (data: any) => fetchApi('/rooms', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => fetchApi(`/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id: number) => fetchApi(`/rooms/${id}`, {
        method: 'DELETE',
    }),
    updateStatus: (id: number, status: string) => fetchApi(`/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    }),
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
    getAll: (filters: { status?: string; roomId?: string } = {}) => {
        const query = new URLSearchParams(filters).toString();
        return fetchApi(`/bookings?${query}`);
    },
    update: (id: number, data: any) => fetchApi(`/bookings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
};

export const statsApi = {
    getOccupancy: (residenceId?: number) => {
        const query = residenceId ? `?residenceId=${residenceId}` : '';
        return fetchApi(`/stats/occupancy${query}`);
    },
};

export const residencesApi = {
    getAll: () => fetchApi('/residences'),
    getById: (id: number | string) => fetchApi(`/residences/${id}`),
    create: (data: any) => fetchApi('/residences', {

        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => fetchApi(`/residences/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id: number) => fetchApi(`/residences/${id}`, {
        method: 'DELETE',
    }),
};



export const uploadsApi = {
    uploadImage: async (file: File): Promise<{ url: string; publicId: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/uploads/image`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            const error: any = new Error(data.message || 'Error al subir imagen');
            error.code = data.code;
            throw error;
        }
        return data.data;
    },

    deleteImage: (publicId: string) =>
        fetchApi('/uploads/image', {
            method: 'DELETE',
            body: JSON.stringify({ publicId }),
        }),
};

export const observationsApi = {
    get: (residenceId: number) => fetchApi(`/observations/${residenceId}`),
    save: (residenceId: number, content: string) =>
        fetchApi(`/observations/${residenceId}`, {
            method: 'PUT',
            body: JSON.stringify({ content }),
        }),
};

