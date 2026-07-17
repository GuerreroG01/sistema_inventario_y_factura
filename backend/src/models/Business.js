import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Business = sequelize.define("Business", {
    id:{
        type: DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    status:{
        type:DataTypes.STRING,
        defaultValue:"ACTIVE"
    },
    createdAt:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
    }
},{
    tableName:"Business",
    timestamps:false
});

export default Business;