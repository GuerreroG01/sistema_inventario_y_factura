import { getInventoryMovements } from "../services/inventoryMovService.js";

export const showInventoryMovements = async (req, res) => {
    try {

        const result = await getInventoryMovements(req.query);

        res.status(200).json({
            ok: true,
            ...result
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};