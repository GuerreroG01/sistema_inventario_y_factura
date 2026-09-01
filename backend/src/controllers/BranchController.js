import {
    createBranch, getBranches, getBranchById, updateBranch, changeBranchStatus,
    deleteBranch, getBranchesByName, getBranchStats
} from "../services/BranchService.js";

export const create = async (req, res) => {
    try {
        const { businessId } = req.params;

        const branch = await createBranch(
            businessId,
            req.body
        );

        return res.status(201).json({
            message: "Sucursal creada correctamente",
            branch
        });

    } catch (error) {
        console.error("Error al crear sucursal:", error);

        return res.status(400).json({
            message: error.message
        });
    }
};

export const getAll = async (req, res) => {
    try {
        const { businessId } = req.params;

        const branches = await getBranches(businessId);

        return res.status(200).json({
            message: "Sucursales obtenidas correctamente",
            branches
        });

    } catch (error) {
        console.error("Error al obtener sucursales:", error);

        return res.status(400).json({
            message: error.message
        });
    }
};

export const getById = async (req, res) => {
    try {
        const { businessId, branchId } = req.params;

        const branch = await getBranchById(
            businessId,
            branchId
        );

        return res.status(200).json({
            message: "Sucursal obtenida correctamente",
            branch
        });

    } catch (error) {
        console.error("Error al obtener sucursal:", error);

        return res.status(404).json({
            message: error.message
        });
    }
};

export const update = async (req, res) => {
    try {
        const { businessId, branchId } = req.params;

        const branch = await updateBranch(
            businessId, branchId, req.body
        );

        return res.status(200).json({
            message: "Sucursal actualizada correctamente",
            branch
        });

    } catch (error) {
        console.error("Error al actualizar sucursal:", error);

        return res.status(400).json({
            message: error.message
        });
    }
};

export const changeStatus = async (req, res) => {
    try {
        const { businessId, branchId } = req.params;
        const { status } = req.body;

        const branch = await changeBranchStatus(
            businessId, branchId, status
        );

        return res.status(200).json({
            message: "Estado de la sucursal actualizado correctamente",
            branch
        });

    } catch (error) {
        console.error("Error al cambiar estado de sucursal:", error);

        return res.status(400).json({
            message: error.message
        });
    }
};

export const deleteMethod = async (req, res) => {
    try {
        const { businessId, branchId } = req.params;

        const result = await deleteBranch(
            businessId,
            branchId
        );

        return res.status(200).json(result);

    } catch (error) {
        console.error("Error al eliminar sucursal:", error);

        return res.status(400).json({
            message: error.message
        });
    }
};

export const getByName = async (req, res) => {
    try {
        const { businessId } = req.params;

        const result = await getBranchesByName(
            businessId,
            req.query
        );

        return res.status(200).json({
            message: "Sucursales obtenidas correctamente",
            ...result
        });

    } catch (error) {
        console.error("Error al buscar sucursales:", error);

        return res.status(400).json({
            message: error.message
        });
    }
};
export const getStats = async (req, res) => {
    try {
        const { businessId } = req.params;

        const stats = await getBranchStats(businessId);
        return res.status(200).json({
            message: "Estadísticas de sucursales obtenidas correctamente",
            stats
        });

    } catch (error) {
        console.error("Error al obtener estadísticas de sucursales:", error);

        return res.status(400).json({
            message: error.message
        });
    }
};