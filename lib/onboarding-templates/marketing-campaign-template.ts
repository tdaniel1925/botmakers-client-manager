/**
 * Marketing Campaign Template
 * Onboarding for digital marketing, advertising, and promotional campaigns
 */

export const marketingCampaignTemplate = {
  id: 'marketing-campaign',
  name: 'Marketing Campaign',
  projectType: 'marketing',
  description: 'Setup for digital marketing campaigns including ads, social media, email, and content marketing',
  estimatedTime: 25, // minutes
  
  conditionalRules: {
    // Show ad platform specific questions
    digitalAds: {
      condition: (responses: any) => 
        responses['step2']?.['campaign_channels']?.includes('Google Ads') ||
        responses['step2']?.['campaign_channels']?.includes('Facebook/Instagram Ads'),
      affectedSteps: ['step2_adConfig']
    },
  },
  
  industryTriggers: {},
  
  steps: [
    {
      type: 'form',
      title: 'Business & Campaign Overview',
      description: 'Tell us about your business and campaign goals',
      estimatedMinutes: 5,
      required: true,
      fields: [
        {
          name: 'industry',
          label: 'Industry',
          type: 'select',
          options: ['E-commerce', 'SaaS', 'Professional Services', 'Healthcare', 'Real Estate', 'Education', 'Other'],
          required: true
        },
        {
          name: 'business_description',
          label: 'Brief business description',
          type: 'textarea',
          required: true
        },
        {
          name: 'campaign_goal',
          label: 'Primary campaign goal',
          type: 'select',
          options: [
            { value: 'brand_awareness', label: 'Brand Awareness' },
            { value: 'lead_generation', label: 'Lead Generation' },
            { value: 'sales_conversion', label: 'Sales/Conversions' },
            { value: 'website_traffic', label: 'Website Traffic' },
            { value: 'engagement', label: 'Engagement' },
            { value: 'other', label: 'Other' }
          ],
          required: true
        }
      ]
    },
    {
      type: 'form',
      title: 'Campaign Details',
      description: 'Campaign specifics and channels',
      estimatedMinutes: 6,
      required: true,
      fields: [
        {
          name: 'campaign_channels',
          label: 'What channels will you use?',
          type: 'checkbox',
          options: [
            'Google Ads',
            'Facebook/Instagram Ads',
            'LinkedIn Ads',
            'TikTok Ads',
            'Email Marketing',
            'Content Marketing',
            'Social Media Organic',
            'SEO',
            'Other'
          ],
          required: true
        },
        {
          name: 'target_audience',
          label: 'Describe your target audience',
          type: 'textarea',
          placeholder: 'Demographics, interests, behaviors, etc.',
          required: true
        },
        {
          name: 'campaign_duration',
          label: 'Campaign duration',
          type: 'select',
          options: [
            { value: '1-2_weeks', label: '1-2 weeks' },
            { value: '1_month', label: '1 month' },
            { value: '3_months', label: '3 months' },
            { value: '6+_months', label: '6+ months' },
            { value: 'ongoing', label: 'Ongoing' }
          ],
          required: true
        }
      ]
    },
    {
      type: 'form',
      title: 'Creative Assets',
      description: 'Marketing materials and content',
      estimatedMinutes: 5,
      required: true,
      fields: [
        {
          name: 'existing_assets',
          label: 'Do you have existing creative assets?',
          type: 'checkbox',
          options: [
            'Logo/brand guidelines',
            'Product images',
            'Ad copy/headlines',
            'Videos',
            'Landing pages',
            'Email templates',
            'None - need help creating'
          ],
          required: true
        },
        {
          name: 'key_message',
          label: 'What\'s your key message or value proposition?',
          type: 'textarea',
          required: true
        },
        {
          name: 'call_to_action',
          label: 'What action do you want people to take?',
          type: 'text',
          placeholder: 'e.g., "Sign up for free trial", "Shop now", "Contact us"',
          required: true
        }
      ]
    },
    {
      type: 'form',
      title: 'Tracking & Success Metrics',
      description: 'How will you measure success?',
      estimatedMinutes: 4,
      required: true,
      fields: [
        {
          name: 'success_metrics',
          label: 'Key success metrics',
          type: 'checkbox',
          options: [
            'Website traffic',
            'Leads generated',
            'Conversions/sales',
            'Cost per acquisition',
            'Return on ad spend (ROAS)',
            'Engagement rate',
            'Email open rate',
            'Other'
          ],
          required: true
        },
        {
          name: 'tracking_setup',
          label: 'Do you have tracking/analytics setup?',
          type: 'checkbox',
          options: [
            'Google Analytics',
            'Facebook Pixel',
            'Conversion tracking',
            'CRM integration',
            'None - need help setting up'
          ],
          required: true
        },
        {
          name: 'target_kpi',
          label: 'Specific target/KPI',
          type: 'textarea',
          placeholder: 'e.g., "Generate 500 leads" or "Achieve 3x ROAS"',
          required: false
        }
      ]
    },
    {
      type: 'review',
      title: 'Review & Confirm',
      description: 'Review your campaign setup',
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
          label: 'Additional notes',
          type: 'textarea',
          required: false
        }
      ]
    }
  ]
};

export default marketingCampaignTemplate;
