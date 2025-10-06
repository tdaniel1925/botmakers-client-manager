/**
 * CRM Implementation Template
 * Onboarding for CRM setup, migration, and configuration
 */

export const crmImplementationTemplate = {
  id: 'crm-implementation',
  name: 'CRM Implementation',
  projectType: 'crm_implementation',
  description: 'Setup for CRM system implementation, migration, and customization',
  estimatedTime: 28, // minutes
  
  conditionalRules: {
    // Show migration questions if they have existing CRM
    migration: {
      condition: (responses: any) => responses['step2']?.['existing_crm'] === 'yes',
      affectedSteps: ['step2_migration']
    },
  },
  
  industryTriggers: {},
  
  steps: [
    {
      type: 'form',
      title: 'Business Context',
      description: 'Your business and current situation',
      estimatedMinutes: 4,
      required: true,
      fields: [
        {
          name: 'industry',
          label: 'Industry',
          type: 'select',
          options: ['Real Estate', 'Insurance', 'Professional Services', 'SaaS', 'E-commerce', 'Healthcare', 'Other'],
          required: true
        },
        {
          name: 'company_size',
          label: 'Company size',
          type: 'select',
          options: [
            { value: '1-5', label: '1-5 employees' },
            { value: '6-20', label: '6-20 employees' },
            { value: '21-50', label: '21-50 employees' },
            { value: '51-200', label: '51-200 employees' },
            { value: '200+', label: '200+ employees' }
          ],
          required: true
        },
        {
          name: 'sales_process_description',
          label: 'Briefly describe your sales process',
          type: 'textarea',
          required: true
        }
      ]
    },
    {
      type: 'form',
      title: 'CRM Requirements',
      description: 'What you need from your CRM',
      estimatedMinutes: 6,
      required: true,
      fields: [
        {
          name: 'existing_crm',
          label: 'Do you have an existing CRM?',
          type: 'radio',
          options: [
            { value: 'yes', label: 'Yes, need to migrate' },
            { value: 'spreadsheets', label: 'Using spreadsheets' },
            { value: 'no', label: 'No system currently' }
          ],
          required: true
        },
        {
          name: 'current_crm_name',
          label: 'Current CRM system',
          type: 'text',
          showIf: { field: 'existing_crm', equals: 'yes' },
          required: false
        },
        {
          name: 'target_crm',
          label: 'Which CRM do you want to implement?',
          type: 'select',
          options: ['HubSpot', 'Salesforce', 'Zoho', 'Pipedrive', 'Go High Level', 'Other', 'Not sure - recommend'],
          required: true
        },
        {
          name: 'required_features',
          label: 'Required CRM features',
          type: 'checkbox',
          options: [
            'Contact management',
            'Deal/pipeline tracking',
            'Email integration',
            'Task management',
            'Reporting/analytics',
            'Email marketing',
            'Automation/workflows',
            'Mobile app',
            'Custom fields',
            'API integrations'
          ],
          required: true
        }
      ]
    },
    {
      type: 'form',
      title: 'Data & Contacts',
      description: 'Your existing data',
      estimatedMinutes: 5,
      required: true,
      fields: [
        {
          name: 'contact_count',
          label: 'Approximate number of contacts/leads',
          type: 'select',
          options: [
            { value: '<100', label: 'Less than 100' },
            { value: '100-500', label: '100-500' },
            { value: '500-2000', label: '500-2,000' },
            { value: '2000-10000', label: '2,000-10,000' },
            { value: '10000+', label: '10,000+' }
          ],
          required: true
        },
        {
          name: 'data_format',
          label: 'Current data format',
          type: 'select',
          options: [
            { value: 'excel', label: 'Excel/CSV' },
            { value: 'crm_export', label: 'CRM export' },
            { value: 'multiple', label: 'Multiple sources' },
            { value: 'none', label: 'Starting fresh' }
          ],
          required: true
        },
        {
          name: 'data_quality',
          label: 'Data quality status',
          type: 'radio',
          options: [
            { value: 'clean', label: 'Clean and organized' },
            { value: 'needs_cleaning', label: 'Needs cleaning/deduplication' },
            { value: 'not_sure', label: 'Not sure' }
          ],
          required: true
        }
      ]
    },
    {
      type: 'form',
      title: 'Integrations',
      description: 'Other tools to connect',
      estimatedMinutes: 4,
      required: true,
      fields: [
        {
          name: 'integrations_needed',
          label: 'What tools need to integrate with CRM?',
          type: 'checkbox',
          options: [
            'Email (Gmail/Outlook)',
            'Calendar',
            'Phone system',
            'Marketing automation',
            'Accounting software (QuickBooks, etc.)',
            'E-commerce platform',
            'Website forms',
            'Social media',
            'Other',
            'None'
          ],
          required: true
        },
        {
          name: 'integration_priorities',
          label: 'Which integrations are most critical?',
          type: 'textarea',
          required: false
        }
      ]
    },
    {
      type: 'form',
      title: 'Team & Training',
      description: 'User setup and training needs',
      estimatedMinutes: 4,
      required: true,
      fields: [
        {
          name: 'user_count',
          label: 'How many users will use the CRM?',
          type: 'select',
          options: [
            { value: '1-5', label: '1-5 users' },
            { value: '6-15', label: '6-15 users' },
            { value: '16-50', label: '16-50 users' },
            { value: '50+', label: '50+ users' }
          ],
          required: true
        },
        {
          name: 'user_roles',
          label: 'Different user roles needed?',
          type: 'textarea',
          placeholder: 'e.g., Sales reps, managers, admins',
          required: false
        },
        {
          name: 'training_needed',
          label: 'Training requirements',
          type: 'checkbox',
          options: [
            'Live training sessions',
            'Video tutorials',
            'Documentation',
            'Ongoing support',
            'Admin training'
          ],
          required: true
        }
      ]
    },
    {
      type: 'review',
      title: 'Review & Confirm',
      description: 'Review your CRM requirements',
      estimatedMinutes: 2,
      required: true,
      fields: [
        {
          name: 'review_acknowledgment',
          label: 'I confirm all information is accurate',
          type: 'checkbox',
          options: ['Yes'],
          required: true
        },
        {
          name: 'additional_notes',
          label: 'Additional requirements or notes',
          type: 'textarea',
          required: false
        }
      ]
    }
  ]
};

export default crmImplementationTemplate;
