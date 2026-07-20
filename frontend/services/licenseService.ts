import api from "./api";
import { License, LicenseStatus } from "@/types/License";

export async function getLicense(
    businessId: number
): Promise<License> {
    try {
        const { data } = await api.get<License>(
            `/licenses/${businessId}`
        );

        return data;

    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            "Error al obtener la licencia"
        );
    }
}

export async function createTrialLicense(
  businessId: number,
  days: number = 14
): Promise<License> {
  try {
    const { data } = await api.post<{
      message: string;
      license: License;
    }>("/licenses", {
      businessId,
      days,
    });

    return data.license;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
      "Error al crear la licencia de prueba"
    );
  }
}

export async function getLicenseStatus(
    businessId: number
): Promise<LicenseStatus> {
    try {
        const { data } = await api.get<LicenseStatus>(
            `/licenses/${businessId}/status`
        );

        return data;

    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            "Error al obtener el estado de la licencia"
        );
    }
}

export async function renewLicense(
  businessId: number,
  duration: number,
  durationUnit: "DAY" | "MONTH" | "YEAR"
): Promise<License> {
  try {
    const { data } = await api.put<{
      message: string;
      license: License;
    }>(`/licenses/${businessId}/renew`, {
      duration,
      durationUnit,
    });

    return data.license;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
      "Error al renovar la licencia"
    );
  }
}

export async function extendLicense(
  businessId: number,
  duration: number,
  durationUnit: "DAY" | "MONTH" | "YEAR"
): Promise<License> {
  try {
    const { data } = await api.put<{
      message: string;
      license: License;
    }>(`/licenses/${businessId}/extend`, {
      duration,
      durationUnit,
    });

    return data.license;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
      "Error al extender la licencia"
    );
  }
}

export async function suspendLicense(
  businessId: number
): Promise<License> {
  try {
    const { data } = await api.put<{
      message: string;
      license: License;
    }>(`/licenses/${businessId}/suspend`);

    return data.license;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
      "Error al suspender la licencia"
    );
  }
}

export async function reactivateLicense(
  businessId: number
): Promise<License> {
  try {
    const { data } = await api.put<{
      message: string;
      license: License;
    }>(`/licenses/${businessId}/reactivate`);

    return data.license;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
      "Error al reactivar la licencia"
    );
  }
}

export async function createLifetimeLicense(
  businessId: number
): Promise<License> {
  try {
    const { data } = await api.put<{
      message: string;
      license: License;
    }>(`/licenses/${businessId}/lifetime`);

    return data.license;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
      "Error al convertir la licencia"
    );
  }
}

export async function revokeLicense(
  businessId: number
): Promise<void> {
  try {
    await api.delete(
      `/licenses/${businessId}/revoke`
    );
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
      "Error al revocar la licencia"
    );
  }
}

export async function changeLicenseType(
  type: "SUBSCRIPTION" | "LIFETIME" | "TRIAL_PERIOD"
): Promise<License> {
  try {
    const { data } = await api.put<{
      message: string;
      license: License;
    }>("/licenses/type", {
      type,
    });

    return data.license;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        "Error al cambiar el tipo de licencia"
    );
  }
}

export async function activatePendingLicense(licenseKey: string): Promise<License> {
  try {
    const { data } = await api.post<{
      message: string;
      license: License;
    }>("/licenses/activate", {
      licenseKey,
    });

    return data.license;

  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
      "Error al activar la licencia"
    );
  }
}