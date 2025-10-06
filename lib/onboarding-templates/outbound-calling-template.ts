/**
 * Outbound Calling Campaign Template
 * Comprehensive onboarding for outbound calling campaigns
 * 10 grouped steps with conditional logic and industry-specific triggers
 */

export const outboundCallingTemplate = {
  id: 'outbound-calling-campaign',
  name: 'Outbound Calling Campaign',
  projectType: 'outbound_calling',
  description: 'Setup for outbound calling campaigns including cold calling, appointment setting, and sales campaigns',
  estimatedTime: 30, // minutes
  
  // Conditional logic rules
  conditionalRules: {
    // Show list building questions if user doesn't have a list
    listBuilding: {
      condition: (responses: any) => responses['step3']?.['list_available'] === 'no',
      affectedSteps: ['step3_listBuilding']
    },
    // Show script help if user doesn't have script
    scriptHelp: {
      condition: (responses: any) => responses['step5']?.['script_status'] === 'no',
      affectedSteps: ['step5_messaging']
    },
    // Show calendar integration if goal is appointment setting
    calendarIntegration: {
      condition: (responses: any) => responses['step2']?.['primary_goal'] === 'appointment_setting',
      affectedSteps: ['step8_calendar']
    },
  },
  
  // Industry-specific triggers
  industryTriggers: {
    healthcare: {
      triggerField: 'industry',
      triggerValue: 'Healthcare',
      additionalQuestions: ['hipaa_compliance', 'recording_consent'],
      complianceWarnings: ['HIPAA compliance required', 'Special recording consent needed']
    },
    financial: {
      triggerField: 'industry',
      triggerValue: 'Financial Services',
      additionalQuestions: ['financial_compliance', 'tcpa_awareness'],
      complianceWarnings: ['TCPA strict rules apply', 'DNC scrubbing required']
    },
    insurance: {
      triggerField: 'industry',
      triggerValue: 'Insurance',
      additionalQuestions: ['insurance_compliance', 'state_regulations'],
      complianceWarnings: ['State-specific insurance regulations may apply']
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
            'Manufacturing/B2B',
            'Other'
          ],
          required: true,
          aiPrompt: 'Analyze industry for compliance requirements'
        },
        {
          name: 'industry_other',
          label: 'Please specify your industry',
          type: 'text',
          showIf: { field: 'industry', equals: 'Other' },
          required: false
        },
        {
          name: 'business_description',
          label: 'In 1-2 sentences, what does your business do?',
          type: 'textarea',
          placeholder: 'e.g., We provide accounting software for small businesses',
          required: true,
          aiPrompt: 'Extract key business value proposition and target market'
        }
      ]
    },
    
    // STEP 2: Campaign Goals (3-5 min)
    {
      type: 'form',
      title: 'Campaign Goals',
      description: 'Define what you want to achieve with this calling campaign',
      estimatedMinutes: 4,
      required: true,
      fields: [
        {
          name: 'primary_goal',
          label: 'What is the main goal of this calling campaign?',
          type: 'select',
          options: [
            { value: 'lead_generation', label: 'Lead Generation (cold prospecting)' },
            { value: 'appointment_setting', label: 'Appointment Setting (book demos/consultations)' },
            { value: 'sales_closing', label: 'Sales/Closing (direct sales on call)' },
            { value: 'customer_reengagement', label: 'Customer Re-engagement (win back lost customers)' },
            { value: 'feedback_survey', label: 'Customer Feedback/Survey' },
            { value: 'event_registration', label: 'Event Registration/Webinar Promotion' },
            { value: 'other', label: 'Other' }
          ],
          required: true,
          aiPrompt: 'Tailor follow-up questions based on campaign goal'
        },
        {
          name: 'success_outcome',
          label: 'What specific outcome defines success for this campaign?',
          type: 'textarea',
          placeholder: 'e.g., "50 qualified appointments booked" or "100 interested leads" or "$25k in sales"',
          required: true,
          helpText: 'Be specific with numbers and metrics',
          aiPrompt: 'Evaluate if goal is realistic based on list size and timeline'
        },
        {
          name: 'start_date',
          label: 'When do you want this campaign to start?',
          type: 'select',
          options: [
            { value: 'asap', label: 'ASAP / Within 1 week' },
            { value: '2-4_weeks', label: 'Within 2-4 weeks' },
            { value: '1-2_months', label: '1-2 months out' },
            { value: 'exploring', label: 'Just exploring (no specific date)' }
          ],
          required: true
        },
        {
          name: 'campaign_duration',
          label: 'Campaign duration?',
          type: 'select',
          options: [
            { value: 'one_time', label: 'One-time push (1-2 weeks)' },
            { value: 'short_term', label: 'Short-term (1 month)' },
            { value: 'ongoing', label: 'Ongoing/continuous' },
            { value: 'custom', label: 'Specific end date' }
          ],
          required: true
        },
        {
          name: 'campaign_end_date',
          label: 'Specific end date',
          type: 'date',
          showIf: { field: 'campaign_duration', equals: 'custom' },
          required: false
        }
      ]
    },
    
    // STEP 3: Target Audience (5 min)
    {
      type: 'form',
      title: 'Target Audience',
      description: 'Who are you calling?',
      estimatedMinutes: 5,
      required: true,
      fields: [
        {
          name: 'audience_type',
          label: 'Who are you calling?',
          type: 'radio',
          options: [
            { value: 'b2b', label: 'B2B (businesses)' },
            { value: 'b2c', label: 'B2C (consumers)' },
            { value: 'both', label: 'Both' }
          ],
          required: true
        },
        {
          name: 'target_description',
          label: 'Describe your ideal target in 1-2 sentences',
          type: 'textarea',
          placeholder: 'e.g., "Small business owners in Florida with 5-20 employees who need accounting software"',
          required: true,
          aiPrompt: 'Extract targeting criteria and evaluate market size'
        },
        {
          name: 'geographic_targeting',
          label: 'What locations are you targeting?',
          type: 'select',
          options: [
            { value: 'nationwide_us', label: 'Nationwide (US)' },
            { value: 'specific_states', label: 'Specific states' },
            { value: 'specific_cities', label: 'Specific cities/regions' },
            { value: 'canada', label: 'Canada' },
            { value: 'other', label: 'Other' }
          ],
          required: true
        },
        {
          name: 'specific_locations',
          label: 'Please specify locations',
          type: 'textarea',
          placeholder: 'List states, cities, or regions',
          showIf: [
            { field: 'geographic_targeting', equals: 'specific_states' },
            { field: 'geographic_targeting', equals: 'specific_cities' }
          ],
          required: false
        },
        {
          name: 'timezone_considerations',
          label: 'Any timezone considerations for call timing?',
          type: 'textarea',
          required: false,
          helpText: 'Optional: Let us know if you have specific timezone preferences'
        }
      ]
    },
    
    // STEP 4: Call List Information (5-7 min)
    {
      type: 'form',
      title: 'Call List Information',
      description: 'Tell us about your contact list (we\'ll collect the actual list later)',
      estimatedMinutes: 6,
      required: true,
      fields: [
        {
          name: 'list_available',
          label: 'Do you have a list of contacts to call?',
          type: 'radio',
          options: [
            { value: 'yes_ready', label: 'Yes, I have a list ready' },
            { value: 'yes_needs_cleaning', label: 'Yes, but needs cleaning/verification' },
            { value: 'no', label: 'No, I need help building a list' },
            { value: 'partial', label: 'Partially (have some contacts, need more)' }
          ],
          required: true
        },
        {
          name: 'list_size',
          label: 'How many contacts are on your list?',
          type: 'select',
          options: [
            { value: '<500', label: 'Less than 500' },
            { value: '500-1000', label: '500-1,000' },
            { value: '1000-5000', label: '1,000-5,000' },
            { value: '5000-10000', label: '5,000-10,000' },
            { value: '10000+', label: '10,000+' }
          ],
          showIf: [
            { field: 'list_available', equals: 'yes_ready' },
            { field: 'list_available', equals: 'yes_needs_cleaning' }
          ],
          required: true,
          aiPrompt: 'Evaluate if list size matches campaign goals and timeline'
        },
        {
          name: 'list_source',
          label: 'Where did this list come from?',
          type: 'select',
          options: [
            'Our existing customer database',
            'Past leads/inquiries',
            'Purchased/rented from data provider',
            'Scraped from public sources (LinkedIn, directories, etc.)',
            'Event attendees (trade show, webinar, etc.)',
            'Referrals/partnerships',
            'Other'
          ],
          showIf: [
            { field: 'list_available', equals: 'yes_ready' },
            { field: 'list_available', equals: 'yes_needs_cleaning' }
          ],
          required: true,
          aiPrompt: 'Assess list quality and compliance needs based on source'
        },
        {
          name: 'list_freshness',
          label: 'How recent/fresh is this list?',
          type: 'select',
          options: [
            { value: '<30_days', label: 'Updated within last 30 days' },
            { value: '1-3_months', label: '1-3 months old' },
            { value: '3-6_months', label: '3-6 months old' },
            { value: '6-12_months', label: '6-12 months old' },
            { value: '12+_months', label: 'Over a year old' },
            { value: 'unknown', label: 'Unknown' }
          ],
          showIf: [
            { field: 'list_available', equals: 'yes_ready' },
            { field: 'list_available', equals: 'yes_needs_cleaning' }
          ],
          required: true,
          aiPrompt: 'Flag if list is stale and suggest verification'
        },
        {
          name: 'data_fields',
          label: 'What data fields do you have for each contact?',
          type: 'checkbox',
          options: [
            'Phone number',
            'First name',
            'Last name',
            'Company name',
            'Job title/role',
            'Email address',
            'Industry',
            'Company size',
            'Location (city/state)',
            'Other'
          ],
          showIf: [
            { field: 'list_available', equals: 'yes_ready' },
            { field: 'list_available', equals: 'yes_needs_cleaning' }
          ],
          required: true,
          aiPrompt: 'Identify missing critical fields for campaign type'
        },
        {
          name: 'dnc_scrubbed',
          label: 'Has this list been scrubbed against Do Not Call (DNC) registries?',
          type: 'radio',
          options: [
            { value: 'yes', label: 'Yes, recently scrubbed' },
            { value: 'no', label: 'No, needs scrubbing' },
            { value: 'not_sure', label: 'Not sure' },
            { value: 'na', label: 'N/A (B2B list - exempt)' }
          ],
          showIf: [
            { field: 'list_available', equals: 'yes_ready' },
            { field: 'list_available', equals: 'yes_needs_cleaning' }
          ],
          required: true,
          aiPrompt: 'Create compliance todo if scrubbing needed'
        },
        {
          name: 'list_building_criteria',
          label: 'What criteria should we use to build your target list?',
          type: 'textarea',
          placeholder: 'e.g., "Companies with 50-200 employees in healthcare industry in California"',
          showIf: [
            { field: 'list_available', equals: 'no' },
            { field: 'list_available', equals: 'partial' }
          ],
          required: true,
          aiPrompt: 'Generate list building requirements and estimate'
        }
      ]
    },
    
    // STEP 5: Calling Script & Messaging (5-7 min)
    {
      type: 'form',
      title: 'Calling Script & Messaging',
      description: 'Your call script and key messages',
      estimatedMinutes: 6,
      required: true,
      fields: [
        {
          name: 'script_status',
          label: 'Do you have a call script prepared?',
          type: 'radio',
          options: [
            { value: 'yes_complete', label: 'Yes, complete script ready' },
            { value: 'yes_draft', label: 'Yes, rough draft or outline' },
            { value: 'no', label: 'No, need help creating one' }
          ],
          required: true
        },
        {
          name: 'script_upload',
          label: 'Upload or paste your script',
          type: 'textarea',
          showIf: [
            { field: 'script_status', equals: 'yes_complete' },
            { field: 'script_status', equals: 'yes_draft' }
          ],
          required: false,
          helpText: 'Paste your script here or note that you\'ll upload a file',
          aiPrompt: 'Analyze script length, clarity, and effectiveness'
        },
        {
          name: 'value_proposition',
          label: 'What\'s your main value proposition? (What problem do you solve?)',
          type: 'textarea',
          placeholder: 'Explain what makes your offering valuable',
          showIf: { field: 'script_status', equals: 'no' },
          required: true,
          aiPrompt: 'Use to generate script draft'
        },
        {
          name: 'call_to_action',
          label: 'What\'s the specific offer or call-to-action?',
          type: 'text',
          placeholder: 'e.g., "Book a free 30-min consultation" or "Get a free quote"',
          required: true,
          aiPrompt: 'Evaluate CTA clarity and conversion potential'
        },
        {
          name: 'expected_objections',
          label: 'What are the top 2-3 objections you expect to hear?',
          type: 'textarea',
          placeholder: 'e.g., "Too expensive," "Not interested," "Call back later"',
          required: false,
          helpText: 'Optional but recommended',
          aiPrompt: 'Generate objection handling responses'
        },
        {
          name: 'call_tone',
          label: 'What tone should calls have?',
          type: 'radio',
          options: [
            { value: 'professional', label: 'Professional/Corporate' },
            { value: 'friendly', label: 'Friendly/Casual' },
            { value: 'consultative', label: 'Consultative/Advisory' },
            { value: 'direct', label: 'Direct/Assertive' },
            { value: 'other', label: 'Other' }
          ],
          required: true
        }
      ]
    },
    
    // STEP 6: Compliance & Legal (3-5 min)
    {
      type: 'form',
      title: 'Compliance & Legal',
      description: 'Ensuring your campaign meets legal requirements',
      estimatedMinutes: 4,
      required: true,
      fields: [
        {
          name: 'contact_relationship',
          label: 'What\'s the relationship with contacts on your list?',
          type: 'radio',
          options: [
            { value: 'existing', label: 'Existing customers' },
            { value: 'past', label: 'Past customers/leads (prior relationship)' },
            { value: 'opted_in', label: 'They opted in (gave permission)' },
            { value: 'cold', label: 'Cold contacts (no prior relationship)' },
            { value: 'mixed', label: 'Mixed' }
          ],
          required: true,
          aiPrompt: 'Determine compliance requirements based on relationship'
        },
        {
          name: 'regulations_awareness',
          label: 'Are you aware of any specific regulations that apply to your calling campaign?',
          type: 'checkbox',
          options: [
            'TCPA (Telephone Consumer Protection Act) - US',
            'State-specific Do Not Call laws',
            'GDPR (if calling Europe)',
            'CASL (if calling Canada)',
            'Not sure / need guidance'
          ],
          required: true,
          aiPrompt: 'Educate on applicable regulations and create compliance checklist'
        },
        {
          name: 'call_recording',
          label: 'Will calls be recorded?',
          type: 'radio',
          options: [
            { value: 'yes_quality', label: 'Yes, for quality assurance' },
            { value: 'yes_compliance', label: 'Yes, for compliance' },
            { value: 'no', label: 'No' },
            { value: 'not_sure', label: 'Not sure' }
          ],
          required: true,
          aiPrompt: 'Add recording consent requirements if needed'
        }
      ]
    },
    
    // STEP 7: Call Timing & Strategy (3-5 min)
    {
      type: 'form',
      title: 'Call Timing & Strategy',
      description: 'When and how often to call',
      estimatedMinutes: 4,
      required: true,
      fields: [
        {
          name: 'call_days',
          label: 'What days should calls be made?',
          type: 'checkbox',
          options: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
          ],
          required: true,
          aiPrompt: 'Suggest optimal days based on industry'
        },
        {
          name: 'call_times',
          label: 'What time windows work best for your audience?',
          type: 'checkbox',
          options: [
            'Morning (8am-12pm)',
            'Afternoon (12pm-5pm)',
            'Evening (5pm-8pm)'
          ],
          required: true,
          helpText: 'Consider your target audience\'s timezone',
          aiPrompt: 'Recommend best times based on audience type and industry'
        },
        {
          name: 'call_attempts',
          label: 'How many call attempts should be made per contact?',
          type: 'select',
          options: [
            { value: '1-2', label: '1-2 attempts (low persistence)' },
            { value: '3-5', label: '3-5 attempts (moderate)' },
            { value: '6-8', label: '6-8 attempts (high persistence)' },
            { value: 'until_reached', label: 'Until contact is reached' }
          ],
          required: true,
          aiPrompt: 'Recommend attempts based on campaign goal and list size'
        },
        {
          name: 'voicemail_strategy',
          label: 'Should we leave voicemails?',
          type: 'radio',
          options: [
            { value: 'every_time', label: 'Yes, leave voicemail on every attempt' },
            { value: 'after_x', label: 'Yes, but only after X attempts' },
            { value: 'no', label: 'No, hang up if voicemail' }
          ],
          required: true
        },
        {
          name: 'voicemail_after_attempts',
          label: 'After how many attempts?',
          type: 'number',
          showIf: { field: 'voicemail_strategy', equals: 'after_x' },
          required: false
        }
      ]
    },
    
    // STEP 8: Technical Setup (3-5 min)
    {
      type: 'form',
      title: 'Technical Setup',
      description: 'Integration and system requirements',
      estimatedMinutes: 4,
      required: true,
      fields: [
        {
          name: 'calling_method',
          label: 'What type of calling do you prefer?',
          type: 'radio',
          options: [
            { value: 'ai_voice', label: 'AI Voice Agent (automated calls with AI)' },
            { value: 'live_agents', label: 'Live human agents' },
            { value: 'hybrid', label: 'Hybrid (AI pre-qualifies, then transfers to human)' },
            { value: 'recommend', label: 'Not sure / recommend best option' }
          ],
          required: true,
          aiPrompt: 'Recommend calling method based on complexity and volume'
        },
        {
          name: 'voice_preference',
          label: 'Voice preference for AI?',
          type: 'radio',
          options: [
            { value: 'male', label: 'Male voice' },
            { value: 'female', label: 'Female voice' },
            { value: 'no_preference', label: 'No preference' }
          ],
          showIf: [
            { field: 'calling_method', equals: 'ai_voice' },
            { field: 'calling_method', equals: 'hybrid' }
          ],
          required: false
        },
        {
          name: 'voice_accent',
          label: 'Any specific accent or language requirements?',
          type: 'text',
          showIf: [
            { field: 'calling_method', equals: 'ai_voice' },
            { field: 'calling_method', equals: 'hybrid' }
          ],
          required: false
        },
        {
          name: 'crm_system',
          label: 'Do you use a CRM system?',
          type: 'select',
          options: [
            'HubSpot',
            'Salesforce',
            'Go High Level',
            'Zoho',
            'Pipedrive',
            'Other',
            'No CRM'
          ],
          required: true
        },
        {
          name: 'crm_other',
          label: 'Please specify your CRM',
          type: 'text',
          showIf: { field: 'crm_system', equals: 'Other' },
          required: false
        },
        {
          name: 'crm_sync',
          label: 'Should campaign results sync to your CRM?',
          type: 'radio',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'not_sure', label: 'Not sure' }
          ],
          required: true
        },
        {
          name: 'calendar_system',
          label: 'What calendar system do you use?',
          type: 'select',
          options: [
            'Calendly',
            'Google Calendar',
            'Outlook/Microsoft',
            'Other',
            'None (manual booking)'
          ],
          showIf: { field: 'primary_goal', equals: 'appointment_setting', fromStep: 'step2' },
          required: false,
          aiPrompt: 'Setup calendar integration if appointment setting'
        },
        {
          name: 'calendar_link',
          label: 'Calendar booking link (if applicable)',
          type: 'text',
          placeholder: 'https://calendly.com/yourname',
          showIf: { field: 'primary_goal', equals: 'appointment_setting', fromStep: 'step2' },
          required: false
        }
      ]
    },
    
    // STEP 9: Performance Tracking (2-3 min)
    {
      type: 'form',
      title: 'Performance Tracking',
      description: 'What metrics matter to you?',
      estimatedMinutes: 3,
      required: true,
      fields: [
        {
          name: 'key_metrics',
          label: 'What metrics matter most to you? (Select top 3)',
          type: 'checkbox',
          maxSelections: 3,
          options: [
            'Total calls made',
            'Contact rate (% that answered)',
            'Conversion rate (% that took action)',
            'Appointments booked',
            'Qualified leads generated',
            'Sales/revenue generated',
            'Average call duration',
            'Best performing time slots',
            'Other'
          ],
          required: true,
          aiPrompt: 'Setup tracking for selected metrics'
        },
        {
          name: 'reporting_frequency',
          label: 'How often do you want campaign updates?',
          type: 'radio',
          options: [
            { value: 'realtime', label: 'Real-time dashboard access' },
            { value: 'daily', label: 'Daily summary email' },
            { value: 'weekly', label: 'Weekly report' },
            { value: 'biweekly', label: 'Bi-weekly' },
            { value: 'end_only', label: 'End of campaign only' }
          ],
          required: true
        }
      ]
    },
    
    // STEP 10: Review & Confirm (2 min)
    {
      type: 'review',
      title: 'Review & Confirm',
      description: 'Review your campaign setup before submission',
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

export default outboundCallingTemplate;
