const License = sequelize.define("License", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    business_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: "Business",
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },

    license_key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    type: {
        type: DataTypes.ENUM(
            "SUBSCRIPTION",
            "LIFETIME",
            "TRIAL_PERIOD"
        ),
        allowNull: false,
        defaultValue: "TRIAL_PERIOD"
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    duration_unit: {
        type: DataTypes.ENUM(
            "DAY",
            "MONTH",
            "YEAR"
        ),
        allowNull: true
    },

    status: {
        type: DataTypes.ENUM(
            "ACTIVE",
            "EXPIRED",
            "SUSPENDED"
        ),
        defaultValue: "ACTIVE"
    },

    activated_at: {
        type: DataTypes.DATE,
    },

    expires_at: {
        type: DataTypes.DATE,
    },

    grace_period_days: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },

    last_validation: {
        type: DataTypes.DATE
    }
});