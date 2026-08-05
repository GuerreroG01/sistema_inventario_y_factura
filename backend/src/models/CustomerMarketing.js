import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CustomerMarketing = sequelize.define("CustomerMarketing", {

    id:{
        type: DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },

    customer_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:"Customers",
            key:"id"
        },
        onUpdate:"CASCADE",
        onDelete:"CASCADE"
    },

    marketing_opt_in:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false,
        comment:"Cliente acepta recibir publicidad"
    },

    last_marketing_sent_at:{
        type:DataTypes.DATE,
        allowNull:true,
        comment:"Fecha del último mensaje enviado"
    },

    marketing_sent_count:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:0,
        comment:"Cantidad de mensajes publicitarios enviados"
    },

    marketing_disabled:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false,
        comment:"Excluir cliente de campañas automáticas"
    },

    marketing_disabled_reason:{
        type:DataTypes.STRING,
        allowNull:true,
        comment:"Razón por la que fue excluido"
    },

    last_purchase_at:{
        type:DataTypes.DATE,
        allowNull:true,
        comment:"Última compra usada para reglas de marketing"
    },

    next_marketing_at:{
        type:DataTypes.DATE,
        allowNull:true,
        comment:"Próxima fecha permitida para enviar publicidad"
    },
    business_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:"Business",
            key:"id"
        },
        onUpdate:"CASCADE",
        onDelete:"RESTRICT"
    }
},{
    tableName:"CustomerMarketing",
    timestamps:true
});


export default CustomerMarketing;