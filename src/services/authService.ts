import apiClient, { axiosPublic } from '../lib/axios';
import { isAxiosError } from 'axios';

// --- Definición de Tipos ---

export interface LoginData {
  email: string;
  password: string;
}

// La respuesta REAL del backend (login y refresh)
export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
}

// Tipo para los datos de registro limpios
export interface CleanRegisterData {
  nombre: string;
  apellido?: string;
  email: string;
  password: string;
  telefono?: string;
}

// Tipo del perfil del usuario
export interface IUserProfile {
  id: string;
  institucion: string;
  cargo: string;
  plazoEntregaActa: string | null;
}

// Tipo básico del usuario (de /users/my)
export interface IBasicUser {
  id: string;
  email: string;
  nombreCompleto: string;
  role: string;
}

// Tipo completo del usuario (de /users/profile)
export interface IUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string | null;
  telefono: string | null;
  role: string;
  is_email_verified: boolean;
  profile: IUserProfile | null;
  profileCompleted: boolean;
}

// Tipo para el cambio de contraseña
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// --- Funciones de Autenticación (Login/Logout/Refresh/Profile) ---

// Usa axiosPublic
export const loginUser = async (
  data: LoginData
): Promise<AuthTokenResponse> => {
  try {
    const response = await axiosPublic.post<AuthTokenResponse>(
      '/auth/login',
      data
    );
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.data?.message) {
      throw new Error(
        error.response.data.message || 'Error al iniciar sesión.'
      );
    }

    // Fallback por si 'data' o 'message' no existen
    if (isAxiosError(error)) {
      throw new Error(error.message || 'Error de Axios al iniciar sesión.');
    }

    throw new Error('No se pudo conectar con el servidor.');
  }
};

export const getAuthenticatedUser = async (): Promise<IBasicUser> => {
  try {
    const response = await apiClient.get<IBasicUser>('/users/my');
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.data?.message) {
      throw new Error(
        error.response.data.message ||
          'Error al obtener datos básicos del usuario.'
      );
    }
    if (isAxiosError(error)) {
      throw new Error(
        error.message || 'Error de Axios al obtener datos básicos del usuario.'
      );
    }
    throw new Error('No se pudo conectar con el servidor.');
  }
};

// Usa apiClient (privado) porque requiere autenticación
export const getMyProfile = async (): Promise<IUser> => {
  try {
    const response = await apiClient.get<IUser>('/users/profile');
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.data?.message) {
      throw new Error(
        error.response.data.message || 'Error al obtener perfil.'
      );
    }
    if (isAxiosError(error)) {
      throw new Error(error.message || 'Error de Axios al obtener perfil.');
    }
    throw new Error('No se pudo conectar con el servidor.');
  }
};

// Usa axiosPublic
export const refreshToken = async (rt: string): Promise<AuthTokenResponse> => {
  try {
    // Enviamos el refreshToken en el body de la petición
    const response = await axiosPublic.post<AuthTokenResponse>(
      '/auth/refresh',
      { refreshToken: rt } // El token va aquí
      // Sin cabecera 'Authorization'
    );
    return response.data;
  } catch (error: unknown) {
    // Mejoramos el manejo de errores
    if (isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message || 'Tu sesión ha expirado.');
    }
    throw new Error('No se pudo refrescar la sesión.');
  }
};

// Usa apiClient (privado) para invalidar el token en el backend
export const logoutUser = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error: unknown) {
    console.error('Error en el logout del servidor:', error);
  }
};

// Usa 'axiosPublic'
export const registerUser = async (
  data: CleanRegisterData
): Promise<{ message: string }> => {
  try {
    const response = await axiosPublic.post<{ message: string }>(
      '/auth/register',
      data
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || 'Error al registrar el usuario.'
      );
    }
    throw new Error('No se pudo conectar con el servidor.');
  }
};

// Usa 'axiosPublic'
export const forgotPassword = async (
  email: string
): Promise<{ message: string }> => {
  try {
    const response = await axiosPublic.post<{ message: string }>(
      '/auth/forgot-password',
      { email }
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message ||
          'Error al enviar el correo de recuperación.'
      );
    }
    throw new Error('No se pudo conectar con el servidor.');
  }
};

// Usa 'axiosPublic'
export const verifyOtp = async (
  email: string,
  otp: string
): Promise<{ message: string; resetToken: string }> => {
  try {
    const response = await axiosPublic.post<{
      message: string;
      resetToken: string;
    }>('/auth/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || 'Error al verificar el OTP.'
      );
    }
    throw new Error('No se pudo conectar con el servidor.');
  }
};

// Usa 'axiosPublic' (el token se pasa en el body, no requiere auth)
export const resetPassword = async (
  email: string,
  newPassword: string,
  otp: string // Asumiendo que el backend lo necesita para validar
): Promise<{ message: string }> => {
  try {
    const response = await axiosPublic.post<{ message: string }>(
      '/auth/reset-password',
      { email, newPassword, otp }
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || 'Error al actualizar la contraseña.'
      );
    }
    throw new Error('No se pudo conectar con el servidor.');
  }
};

// Usa 'axiosPublic'
export const confirmEmail = async (
  token: string
): Promise<{ message: string }> => {
  try {
    const response = await axiosPublic.get<{ message: string }>(
      `/auth/confirm-email/${token}`
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || 'Error al confirmar el email.'
      );
    }
    throw new Error('No se pudo conectar con el servidor.');
  }
};

/**
 * Actualiza los datos básicos del usuario (nombre, apellido, teléfono).
 * Llama al endpoint PUT /users/profile
 */
export const updateUser = async (data: {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  institucion?: string;
  cargo?: string;
}): Promise<IUser> => {
  try {
    const response = await apiClient.patch<IUser>('/users/profile', data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || 'Error al actualizar usuario.'
      );
    }
    throw new Error('No se pudo conectar con el servidor.');
  }
};

/**
 * Crea o actualiza el perfil del usuario (institución, cargo).
 * Llama al endpoint POST /users/complete-profile
 */
export const updateProfile = async (data: {
  institucion: string;
  cargo: string;
  plazoEntregaActa?: string | null;
}): Promise<IUserProfile> => {
  try {
    const response = await apiClient.post<IUserProfile>(
      '/users/complete-profile',
      data
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || 'Error al actualizar perfil.'
      );
    }
    throw new Error('No se pudo conectar con el servidor.');
  }
};

/**
 * Elimina la cuenta del usuario.
 * Llama al endpoint DELETE /users/delete-account
 */
export const deleteAccount = async (
  password: string
): Promise<{ message: string }> => {
  try {
    // El endpoint del backend es /users/delete-account
    const response = await apiClient.delete<{ message: string }>('/users/me', {
      data: { password }, // El DTO espera la contraseña en el body
    });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || 'Error al eliminar la cuenta.'
      );
    }
    throw new Error('No se pudo conectar con el servidor.');
  }
};

/**
 * Cambia la contraseña del usuario autenticado.
 * Endpoint: POST /users/password/change
 */
export const changePassword = async (
  data: ChangePasswordData
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<{ message: string }>(
      '/users/password/change',
      data
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || 'Error al cambiar la contraseña.'
      );
    }
    throw new Error('No se pudo conectar con el servidor.');
  }
};