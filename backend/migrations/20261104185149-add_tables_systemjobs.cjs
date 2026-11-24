
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SystemJobs', {

      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false
      },

      business_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Business',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      job_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      job_category: {
        type: Sequelize.STRING(50),
        allowNull: true
      },

      payload: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: Sequelize.literal("'{}'::jsonb")
      },

      batch_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 50
      },

      max_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3
      },

      status: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'PENDING'
      },

      total_records: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      last_record_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },

      total_processed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      total_failed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      total_batches: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      completed_batches: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      locked_by: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      locked_until: {
        type: Sequelize.DATE,
        allowNull: true
      },

      started_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      last_error_code: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      last_error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      last_error_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      error_details: {
        type: Sequelize.JSONB,
        allowNull: true
      },

      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      }

    });

    await queryInterface.addIndex(
      'SystemJobs',
      ['business_id', 'status'],
      {
        name: 'idx_system_jobs_business_status'
      }
    );

    await queryInterface.addIndex(
      'SystemJobs',
      ['job_type'],
      {
        name: 'idx_system_jobs_type'
      }
    );

    await queryInterface.addIndex(
      'SystemJobs',
      ['status', 'createdAt'],
      {
        name: 'idx_system_jobs_status_created'
      }
    );

    await queryInterface.addIndex(
      'SystemJobs',
      ['last_error_code'],
      {
        name: 'idx_system_jobs_last_error_code'
      }
    );

    await queryInterface.addConstraint('SystemJobs', {
      fields: ['batch_size'],
      type: 'check',
      name: 'chk_system_jobs_batch_size',
      where: {
        batch_size: {
          [Sequelize.Op.gt]: 0
        }
      }
    });

    await queryInterface.addConstraint('SystemJobs', {
      fields: ['attempts', 'max_attempts'],
      type: 'check',
      name: 'chk_system_jobs_attempts',
      where: Sequelize.literal(
        '"attempts" >= 0 AND "max_attempts" > 0'
      )
    });

    await queryInterface.createTable('SystemJobErrors', {

      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false
      },

      job_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'SystemJobs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      business_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Business',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      batch_number: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      attempt_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },

      error_code: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      error_message: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      error_stack: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      error_details: {
        type: Sequelize.JSONB,
        allowNull: true
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      }
    });
    await queryInterface.createTable('BenefitProcessingIssues', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false
      },

      business_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Business',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      benefit_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'AGUINALDO o INDEMNIZACION'
      },

      period: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Periodo del beneficio, por ejemplo 2026'
      },

      issue_code: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      issue_message: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      status: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'PENDING',
        comment: 'PENDING, READY, PROCESSING, RESOLVED, IGNORED'
      },

      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      processing_job_id: {
        type: Sequelize.UUID,
        allowNull: true
      },

      detected_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },

      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      last_attempt_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      }
    });

    await queryInterface.addIndex(
      'SystemJobErrors',
      ['job_id'],
      {
        name: 'idx_system_job_errors_job'
      }
    );

    await queryInterface.addIndex(
      'SystemJobErrors',
      ['business_id'],
      {
        name: 'idx_system_job_errors_business'
      }
    );

    await queryInterface.addIndex(
      'SystemJobErrors',
      ['employee_id'],
      {
        name: 'idx_system_job_errors_employee'
      }
    );

    await queryInterface.addIndex(
      'SystemJobErrors',
      ['error_code'],
      {
        name: 'idx_system_job_errors_code'
      }
    );

    await queryInterface.addIndex(
      'SystemJobErrors',
      ['job_id', 'attempt_number'],
      {
        name: 'idx_system_job_errors_job_attempt'
      }
    );

    await queryInterface.addIndex(
      'BenefitProcessingIssues',
      ['business_id', 'employee_id'],
      {
        name: 'idx_benefit_issues_business_employee'
      }
    );

    await queryInterface.addIndex(
      'BenefitProcessingIssues',
      ['employee_id', 'benefit_type', 'period'],
      {
          name: 'idx_benefit_issues_employee_benefit_period'
      }
    );

    await queryInterface.addIndex(
      'BenefitProcessingIssues',
      ['status', 'detected_at'],
      {
          name: 'idx_benefit_issues_status_detected'
      }
    );

    await queryInterface.addIndex(
      'BenefitProcessingIssues',
      ['issue_code'],
      {
        name: 'idx_benefit_issues_code'
      }
    );

    await queryInterface.addIndex(
      'BenefitProcessingIssues',
      ['business_id', 'status', 'benefit_type', 'period'],
      {
          name: 'idx_benefit_issues_business_status_period'
      }
    );

    await queryInterface.addIndex(
      'BenefitProcessingIssues',
      ['processing_job_id'],
      {
        name: 'idx_benefit_issues_processing_job'
      }
    );

    await queryInterface.addConstraint('SystemJobErrors', {
      fields: ['attempt_number'],
      type: 'check',
      name: 'chk_system_job_errors_attempt',
      where: Sequelize.literal('"attempt_number" > 0')
    });
    await queryInterface.addConstraint(
      'BenefitProcessingIssues',
      {
        fields: ['attempts'],
        type: 'check',
        name: 'chk_benefit_issues_attempts',
        where: Sequelize.literal('"attempts" >= 0')
      }
    );

  },

  async down(queryInterface) {
    await queryInterface.dropTable('SystemJobErrors');
    await queryInterface.dropTable('SystemJobs');
    await queryInterface.dropTable('BenefitProcessingIssues');
  }
};