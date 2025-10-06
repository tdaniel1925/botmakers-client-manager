/**
 * Inbound Calling/Call Center Template
 * Comprehensive onboarding for inbound call handling and customer service
 * 11 grouped steps with conditional logic and integration requirements
 */

export const inboundCallingTemplate = {
  id: 'inbound-call-center',
  name: 'Inbound Call Center Setup',
  projectType: 'inbound_calling',
  description: 'Setup for inbound call handling, customer service, support lines, and appointment scheduling',
  estimatedTime: 32, // minutes
  
  // Conditional logic rules
  conditionalRules: {
    // Show IVR menu config if they want IVR
    ivrMenu: {
      condition: (responses: any) => 
        responses['step3']?.['ivr_menu'] === 'yes_multilevel' || 
        responses['step3']?.['ivr_menu'] === 'yes_simple',
      affectedSteps: ['step3_ivrConfig']
    },
    // Show agent training if using humans
    agentTraining: {
      condition: (responses: any) => 
        responses['step5']?.['staffing_model'] === 'inhouse' || 
        responses['step5']?.['staffing_model'] === 'outsourced',
      affectedSteps: ['step5_training']
    },
    // Show AI config if using AI
    aiConfig: {
      condition: (responses: any) => 
        responses['step7']?.['ai_capabilities']?.includes('Answer common FAQs') ||
        responses['step7']?.['ai_capabilities']?.length > 0,
      affectedSteps: ['step7_aiHandoff']
    },
  },
  
  // Industry-specific triggers
  industryTriggers: {
    healthcare: {
      triggerField: 'industry',
      triggerValue: 'Healthcare',
      additionalQuestions: ['hipaa_compliance', 'phi_handling'],
      complianceWarnings: ['HIPAA compliance required for patient data', 'Secure call recording needed']
    },
    financial: {
      triggerField: 'industry',
      triggerValue: 'Financial Services',
      additionalQuestions: ['pci_compliance', 'financial_data_security'],
      complianceWarnings: ['PCI-DSS compliance required', 'Call recording retention rules apply']
    },
    ecommerce: {
      triggerField: 'industry',
      triggerValue: 'E-commerce/Retail',
      additionalQuestions: ['payment_processing', 'order_management'],
      complianceWarnings: ['Payment card data handling protocols needed']
    },
  },
  
  // Steps configuration
  steps: [
    // STEP 1: Business Context (2-3 min)
    {
      type: 'form',
      title: 'Business Context',
      description: 'Tell us about your business and industry',
      estimatedMinutes: 3,
      required: true,
      fields: [
        {
          name: 'industry',
          label: 'What industry does your business operate in?',
          type: 'select',
          options: [
            'Healthcare',
            'Real Estate',
            'Financial Services',
            'SaaS/Technology',
            'E-commerce/Retail',
            'Education',
            'Home Services',
            'Insurance',
            'Professional Services',
            'Hospitality',
            'Other'
          ],
          required: true,
          aiPrompt: 'Analyze industry for compliance and call handling requirements'
        },
        {
          name: 'business_description',
          label: 'In 1-2 sentences, what does your business do?',
          type: 'textarea',
          placeholder: 'e.g., We sell premium coffee subscriptions online',
          required: true,
          aiPrompt: 'Understand business model to recommend call handling strategies'
        }
      ]
    },
    
    // STEP 2: Inbound Purpose (3-5 min)
    {
      type: 'form',
      title: 'Inbound Campaign Purpose',
      description: 'What is the main purpose of your inbound calling system?',
      estimatedMinutes: 4,
      required: true,
      fields: [
        {
          name: 'primary_purpose',
          label: 'What is the main purpose of your inbound calling system?',
          type: 'select',
          options: [
            { value: 'customer_support', label: 'Customer Support/Service' },
            { value: 'order_processing', label: 'Order Processing/Sales' },
            { value: 'tech_support', label: 'Technical Support/Help Desk' },
            { value: 'appointment_scheduling', label: 'Appointment Scheduling' },
            { value: 'general_inquiries', label: 'General Inquiries' },
            { value: 'lead_qualification', label: 'Lead Qualification (inbound leads)' },
            { value: 'mixed', label: 'Mixed (multiple purposes)' },
            { value: 'other', label: 'Other' }
          ],
          required: true,
          aiPrompt: 'Tailor call flow and routing based on purpose'
        },
        {
          name: 'call_volume',
          label: 'What\'s your expected call volume?',
          type: 'select',
          options: [
            { value: '<50', label: 'Less than 50 calls/day' },
            { value: '50-100', label: '50-100 calls/day' },
            { value: '100-500', label: '100-500 calls/day' },
            { value: '500-1000', label: '500-1,000 calls/day' },
            { value: '1000+', label: '1,000+ calls/day' },
            { value: 'seasonal', label: 'Seasonal/varies significantly' }
          ],
          required: true,
          aiPrompt: 'Recommend staffing and system capacity'
        },
        {
          name: 'historical_data',
          label: 'Do you have historical data on call patterns?',
          type: 'radio',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ],
          required: false,
          helpText: 'Optional: Helps us optimize for peak times'
        }
      ]
    },
    
    // STEP 3: Call Routing & Handling (5-7 min)
    {
      type: 'form',
      title: 'Call Routing & Handling',
      description: 'How should calls be routed and managed?',
      estimatedMinutes: 6,
      required: true,
      fields: [
        {
          name: 'business_hours',
          label: 'What are your operating hours?',
          type: 'select',
          options: [
            { value: 'business_hours', label: 'Business hours only (M-F, 9am-5pm)' },
            { value: 'extended', label: 'Extended hours (evenings/weekends)' },
            { value: '24_7', label: '24/7' },
            { value: 'custom', label: 'Custom schedule' }
          ],
          required: true
        },
        {
          name: 'custom_schedule',
          label: 'Describe your custom schedule',
          type: 'textarea',
          placeholder: 'e.g., Mon-Fri 8am-8pm, Sat 10am-4pm',
          showIf: { field: 'business_hours', equals: 'custom' },
          required: false
        },
        {
          name: 'after_hours_handling',
          label: 'What happens when you\'re closed?',
          type: 'select',
          options: [
            { value: 'voicemail', label: 'Voicemail' },
            { value: 'after_hours_message', label: 'After-hours message' },
            { value: 'answering_service', label: 'Route to answering service' },
            { value: 'ai_handles', label: 'AI handles basic inquiries' },
            { value: 'other', label: 'Other' }
          ],
          required: true
        },
        {
          name: 'department_routing',
          label: 'Do you need calls routed to different departments or people?',
          type: 'radio',
          options: [
            { value: 'no', label: 'No, all calls go to same place' },
            { value: 'departments', label: 'Yes, need department routing (sales, support, billing, etc.)' },
            { value: 'skill_based', label: 'Yes, need skill-based routing' },
            { value: 'priority', label: 'Yes, need priority routing (VIP customers)' }
          ],
          required: true
        },
        {
          name: 'routing_details',
          label: 'What departments/routing options do you need?',
          type: 'textarea',
          placeholder: 'Example: "1 for Sales, 2 for Support, 3 for Billing"',
          showIf: [
            { field: 'department_routing', equals: 'departments' },
            { field: 'department_routing', equals: 'skill_based' },
            { field: 'department_routing', equals: 'priority' }
          ],
          required: false,
          aiPrompt: 'Structure IVR menu based on routing needs'
        },
        {
          name: 'ivr_menu',
          label: 'Do you want an IVR (automated phone menu)?',
          type: 'radio',
          options: [
            { value: 'yes_multilevel', label: 'Yes, multi-level menu' },
            { value: 'yes_simple', label: 'Yes, simple one-level menu' },
            { value: 'no', label: 'No, direct to agent/person' },
            { value: 'ai_assistant', label: 'AI assistant instead (conversational routing)' }
          ],
          required: true
        },
        {
          name: 'ivr_structure',
          label: 'Describe your ideal menu structure',
          type: 'textarea',
          placeholder: 'Example: "Press 1 for new customers, Press 2 for existing customers..."',
          showIf: [
            { field: 'ivr_menu', equals: 'yes_multilevel' },
            { field: 'ivr_menu', equals: 'yes_simple' }
          ],
          required: false,
          aiPrompt: 'Generate IVR script and structure'
        }
      ]
    },
    
    // STEP 4: Call Handling Procedures (5 min)
    {
      type: 'form',
      title: 'Call Handling Procedures',
      description: 'Standard procedures for handling calls',
      estimatedMinutes: 5,
      required: true,
      fields: [
        {
          name: 'greeting',
          label: 'What should the greeting be when calls are answered?',
          type: 'textarea',
          placeholder: 'Example: "Thank you for calling [Company]. How can I help you today?"',
          required: true,
          aiPrompt: 'Ensure professional and brand-aligned greeting'
        },
        {
          name: 'caller_info_capture',
          label: 'What information do you need to collect from callers?',
          type: 'checkbox',
          options: [
            'Name',
            'Phone number',
            'Email address',
            'Account number/Customer ID',
            'Reason for calling',
            'Company name',
            'Other'
          ],
          required: true
        },
        {
          name: 'common_inquiry_types',
          label: 'What are the top 3-5 types of calls you receive?',
          type: 'textarea',
          placeholder: 'Example: "Pricing questions, order status, technical issues, new customer signup"',
          required: true,
          aiPrompt: 'Create FAQ and knowledge base structure'
        },
        {
          name: 'escalation_triggers',
          label: 'When should calls be escalated or transferred?',
          type: 'checkbox',
          options: [
            'Complex technical issues',
            'Angry/upset customers',
            'High-value opportunities',
            'Management requests',
            'Refund/billing disputes',
            'Other'
          ],
          required: true
        },
        {
          name: 'escalation_contact',
          label: 'Who should escalated calls go to?',
          type: 'text',
          placeholder: 'Name/role/phone number',
          required: false,
          aiPrompt: 'Setup escalation routing'
        }
      ]
    },
    
    // STEP 5: Agent/Staff Setup (3-5 min)
    {
      type: 'form',
      title: 'Agent/Staff Setup',
      description: 'Who will handle incoming calls?',
      estimatedMinutes: 4,
      required: true,
      fields: [
        {
          name: 'staffing_model',
          label: 'Who will handle incoming calls?',
          type: 'radio',
          options: [
            { value: 'inhouse', label: 'In-house staff' },
            { value: 'outsourced', label: 'Outsourced call center/answering service' },
            { value: 'ai', label: 'AI voice agent (automated)' },
            { value: 'hybrid', label: 'Hybrid (AI for simple, humans for complex)' }
          ],
          required: true
        },
        {
          name: 'agent_count',
          label: 'How many agents will be handling calls?',
          type: 'select',
          options: [
            { value: '1-2', label: '1-2 agents' },
            { value: '3-5', label: '3-5 agents' },
            { value: '6-10', label: '6-10 agents' },
            { value: '10+', label: '10+ agents' }
          ],
          showIf: [
            { field: 'staffing_model', equals: 'inhouse' },
            { field: 'staffing_model', equals: 'outsourced' }
          ],
          required: false
        },
        {
          name: 'training_materials_needed',
          label: 'Do agents need training materials?',
          type: 'checkbox',
          options: [
            'Product/service information',
            'FAQs',
            'Troubleshooting guides',
            'Scripts/call flows',
            'Company policies',
            'Other'
          ],
          showIf: [
            { field: 'staffing_model', equals: 'inhouse' },
            { field: 'staffing_model', equals: 'outsourced' }
          ],
          required: false,
          aiPrompt: 'Generate training materials list'
        }
      ]
    },
    
    // STEP 6: CRM & System Integration (3-5 min)
    {
      type: 'form',
      title: 'CRM & System Integration',
      description: 'System integration requirements',
      estimatedMinutes: 4,
      required: true,
      fields: [
        {
          name: 'crm_system',
          label: 'Do you use a CRM or customer database?',
          type: 'select',
          options: [
            'HubSpot',
            'Salesforce',
            'Zoho',
            'Zendesk',
            'Freshdesk',
            'Go High Level',
            'Custom system',
            'Excel/Google Sheets',
            'None'
          ],
          required: true
        },
        {
          name: 'crm_sync',
          label: 'Should call data sync with your CRM?',
          type: 'radio',
          options: [
            { value: 'yes_all', label: 'Yes, log all calls automatically' },
            { value: 'yes_certain', label: 'Yes, log only certain call types' },
            { value: 'no', label: 'No' },
            { value: 'not_sure', label: 'Not sure' }
          ],
          required: true
        },
        {
          name: 'existing_phone_system',
          label: 'Do you have an existing phone system?',
          type: 'select',
          options: [
            { value: 'pbx', label: 'Yes, traditional PBX' },
            { value: 'voip', label: 'Yes, VoIP (RingCentral, 8x8, etc.)' },
            { value: 'cloud', label: 'Yes, other cloud system' },
            { value: 'none', label: 'No, starting from scratch' }
          ],
          required: true
        },
        {
          name: 'phone_number',
          label: 'What phone number will be used?',
          type: 'select',
          options: [
            { value: 'existing', label: 'Use existing number' },
            { value: 'new', label: 'Get new number' },
            { value: 'port', label: 'Port existing number to new system' },
            { value: 'not_sure', label: 'Not sure' }
          ],
          required: true
        },
        {
          name: 'existing_number',
          label: 'Existing phone number',
          type: 'text',
          placeholder: '+1 (555) 123-4567',
          showIf: [
            { field: 'phone_number', equals: 'existing' },
            { field: 'phone_number', equals: 'port' }
          ],
          required: false
        }
      ]
    },
    
    // STEP 7: AI & Automation Features (3-5 min)
    {
      type: 'form',
      title: 'AI & Automation Features',
      description: 'What should AI handle automatically?',
      estimatedMinutes: 4,
      required: true,
      fields: [
        {
          name: 'ai_capabilities',
          label: 'What tasks should AI handle automatically?',
          type: 'checkbox',
          options: [
            'Answer common FAQs',
            'Check order status',
            'Schedule appointments',
            'Collect customer information',
            'Qualify leads',
            'Process simple transactions',
            'None (all calls to humans)',
            'Other'
          ],
          required: true,
          aiPrompt: 'Configure AI capabilities and training'
        },
        {
          name: 'ai_handoff_triggers',
          label: 'When should AI transfer to a human?',
          type: 'checkbox',
          options: [
            'When caller requests',
            'For complex questions AI can\'t answer',
            'For sales opportunities',
            'For complaints/issues',
            'After X minutes',
            'Other'
          ],
          showIf: (responses: any) => 
            responses['step7']?.['ai_capabilities']?.length > 0 && 
            !responses['step7']?.['ai_capabilities']?.includes('None (all calls to humans)'),
          required: false
        }
      ]
    },
    
    // STEP 8: Compliance & Recording (3 min)
    {
      type: 'form',
      title: 'Compliance & Recording',
      description: 'Legal and compliance requirements',
      estimatedMinutes: 3,
      required: true,
      fields: [
        {
          name: 'call_recording',
          label: 'Do you need to record calls?',
          type: 'radio',
          options: [
            { value: 'all', label: 'Yes, all calls' },
            { value: 'sample', label: 'Yes, for quality assurance (sample)' },
            { value: 'compliance', label: 'Yes, for compliance/legal' },
            { value: 'no', label: 'No' }
          ],
          required: true
        },
        {
          name: 'recording_consent',
          label: 'Do you have consent/disclosure language for recording?',
          type: 'radio',
          options: [
            { value: 'yes', label: 'Yes, have approved language' },
            { value: 'no', label: 'No, need help with this' }
          ],
          showIf: [
            { field: 'call_recording', equals: 'all' },
            { field: 'call_recording', equals: 'sample' },
            { field: 'call_recording', equals: 'compliance' }
          ],
          required: false,
          aiPrompt: 'Provide recording consent script'
        },
        {
          name: 'sensitive_data',
          label: 'Do callers provide sensitive information?',
          type: 'checkbox',
          options: [
            'Credit card details',
            'Social Security numbers',
            'Medical information',
            'Financial account info',
            'No sensitive data',
            'Other'
          ],
          required: true,
          aiPrompt: 'Flag security and compliance requirements'
        }
      ]
    },
    
    // STEP 9: Performance & Reporting (3 min)
    {
      type: 'form',
      title: 'Performance & Reporting',
      description: 'Metrics and reporting needs',
      estimatedMinutes: 3,
      required: true,
      fields: [
        {
          name: 'key_metrics',
          label: 'What metrics matter most to you? (Select top 3)',
          type: 'checkbox',
          maxSelections: 3,
          options: [
            'Total calls received',
            'Average wait time',
            'Call abandonment rate',
            'First call resolution rate',
            'Customer satisfaction (CSAT)',
            'Average handle time',
            'Call-to-conversion rate',
            'Peak call times',
            'Other'
          ],
          required: true
        },
        {
          name: 'reporting_frequency',
          label: 'How often do you want performance reports?',
          type: 'radio',
          options: [
            { value: 'realtime', label: 'Real-time dashboard' },
            { value: 'daily', label: 'Daily summary' },
            { value: 'weekly', label: 'Weekly report' },
            { value: 'monthly', label: 'Monthly report' }
          ],
          required: true
        }
      ]
    },
    
    // STEP 10: Business Continuity (2-3 min)
    {
      type: 'form',
      title: 'Business Continuity',
      description: 'Handling high call volumes and overflow',
      estimatedMinutes: 3,
      required: true,
      fields: [
        {
          name: 'overflow_handling',
          label: 'What happens when all agents are busy?',
          type: 'select',
          options: [
            { value: 'hold_queue', label: 'Hold queue with music' },
            { value: 'voicemail', label: 'Voicemail with callback' },
            { value: 'ai_handles', label: 'AI handles the call' },
            { value: 'overflow_number', label: 'Overflow to backup number' },
            { value: 'other', label: 'Other' }
          ],
          required: true
        },
        {
          name: 'max_hold_time',
          label: 'Maximum acceptable hold time?',
          type: 'select',
          options: [
            { value: '30sec', label: '30 seconds' },
            { value: '1min', label: '1 minute' },
            { value: '2-3min', label: '2-3 minutes' },
            { value: '5+min', label: '5+ minutes' },
            { value: 'no_limit', label: 'No limit' }
          ],
          required: false
        },
        {
          name: 'callback_option',
          label: 'Should callers have option to request callback instead of waiting?',
          type: 'radio',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ],
          required: false
        }
      ]
    },
    
    // STEP 11: Review & Confirm (2 min)
    {
      type: 'review',
      title: 'Review & Confirm',
      description: 'Review your inbound call center setup',
      estimatedMinutes: 2,
      required: true,
      fields: [
        {
          name: 'review_acknowledgment',
          label: 'I have reviewed all information and confirm it is accurate',
          type: 'checkbox',
          options: ['Yes, everything looks good'],
          required: true
        },
        {
          name: 'additional_notes',
          label: 'Any additional notes or special requirements?',
          type: 'textarea',
          placeholder: 'Optional: Share anything else we should know',
          required: false
        }
      ]
    }
  ]
};

export default inboundCallingTemplate;
