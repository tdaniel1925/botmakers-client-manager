/**
 * Web Design Project - Task Generation Rules
 * Converts web design onboarding responses into actionable tasks
 */

import {
  TaskGenerationRule,
  calculateDueDate,
  hasFileUploads,
  hasTextResponse,
  arrayIncludes,
  getResponseValue,
} from "../onboarding-task-mapper";

export const webDesignRules: TaskGenerationRule[] = [
  // Rule 1: Logo/Brand Assets Upload
  {
    id: "web-design-logo-upload",
    name: "Logo Upload Review",
    description: "Create task to review and optimize uploaded logo files",
    responseKey: ["logo_upload", "brand_assets"],
    priority: 10,
    condition: (responses) => {
      return hasFileUploads(responses, "logo_upload") || hasFileUploads(responses, "brand_assets");
    },
    generateTasks: (responses, context) => {
      const tasks = [];

      if (hasFileUploads(responses, "logo_upload")) {
        tasks.push({
          title: "Review and optimize logo files",
          description: `Review the logo files uploaded by the client and ensure they are:
- High resolution (at least 300 DPI for print)
- Available in multiple formats (PNG, SVG, JPG)
- Optimized for web use
- Include transparent background versions

If files need optimization or reformatting, prepare the necessary versions.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 2),
        });
      }

      if (hasFileUploads(responses, "brand_assets")) {
        tasks.push({
          title: "Organize brand assets library",
          description: `Create a centralized brand assets library with:
- All uploaded brand materials
- Color palette extraction
- Font identification
- Style guide documentation
- Asset naming conventions`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 3),
        });
      }

      return tasks;
    },
  },

  // Rule 2: Design Style Preferences
  {
    id: "web-design-style-research",
    name: "Design Style Research",
    description: "Research and create moodboard based on selected design styles",
    responseKey: "design_style",
    priority: 9,
    condition: (responses) => {
      const style = getResponseValue(responses, "design_style", "");
      return typeof style === "string" && style.length > 0;
    },
    generateTasks: (responses, context) => {
      const style = getResponseValue(responses, "design_style", "");
      
      return [
        {
          title: `Create ${style} design moodboard`,
          description: `Research and compile a comprehensive moodboard for ${style} design aesthetic including:
- 10-15 reference websites
- Color palette suggestions
- Typography recommendations
- UI element examples
- Layout patterns
- Animation/interaction ideas

Focus on modern, conversion-optimized examples.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 3),
        },
        {
          title: "Present design direction to client",
          description: `Prepare and present the ${style} design direction including:
- Moodboard overview
- 2-3 design concept options
- Rationale for each direction
- Next steps and timeline

Schedule a call or create a detailed presentation document.`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 7),
        },
      ];
    },
  },

  // Rule 3: Website Goals and Functionality
  {
    id: "web-design-functionality",
    name: "Functionality Planning",
    description: "Plan technical requirements based on website goals",
    responseKey: "website_goal",
    priority: 8,
    condition: (responses) => {
      return hasTextResponse(responses, "website_goal");
    },
    generateTasks: (responses, context) => {
      const goal = getResponseValue(responses, "website_goal", "").toLowerCase();
      const tasks = [];

      // E-commerce specific tasks
      if (goal.includes("ecommerce") || goal.includes("sell")) {
        tasks.push({
          title: "Research e-commerce platform options",
          description: `Evaluate e-commerce platforms for the project:
- Shopify vs WooCommerce vs custom solution
- Payment gateway options (Stripe, PayPal)
- Inventory management needs
- Shipping integration requirements
- Tax calculation setup

Prepare recommendation with pros/cons for each option.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 5),
        });

        tasks.push({
          title: "Plan product catalog structure",
          description: `Design the product catalog architecture:
- Category hierarchy
- Product attributes and variations
- Filter and search functionality
- Product page layout
- Cart and checkout flow`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 7),
        });
      }

      // Lead generation specific tasks
      if (goal.includes("lead") || goal.includes("contact")) {
        tasks.push({
          title: "Design lead capture strategy",
          description: `Create comprehensive lead generation plan:
- Form placement and design
- CTA optimization
- Exit-intent popups
- Lead magnet creation
- Email marketing integration
- CRM setup recommendations`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 5),
        });
      }

      // Portfolio/showcase specific tasks
      if (goal.includes("portfolio") || goal.includes("showcase")) {
        tasks.push({
          title: "Plan portfolio showcase layout",
          description: `Design portfolio presentation strategy:
- Project card design
- Filtering and categorization
- Case study page template
- Gallery/lightbox functionality
- Project detail pages
- Contact integration`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 6),
        });
      }

      return tasks;
    },
  },

  // Rule 4: Required Pages Planning
  {
    id: "web-design-pages-planning",
    name: "Page Structure Planning",
    description: "Create tasks for each required page",
    responseKey: "required_pages",
    priority: 7,
    condition: (responses) => {
      const pages = getResponseValue(responses, "required_pages", []);
      return Array.isArray(pages) && pages.length > 0;
    },
    generateTasks: (responses, context) => {
      const pages = getResponseValue<string[]>(responses, "required_pages", []);

      return [
        {
          title: "Create sitemap and information architecture",
          description: `Develop complete site structure including:

Required Pages:
${pages.map((page) => `- ${page}`).join("\n")}

Include:
- Page hierarchy
- Navigation structure
- Internal linking strategy
- URL structure
- Breadcrumb requirements`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 4),
        },
        {
          title: "Plan content requirements for all pages",
          description: `Document content needs for each page:
${pages.map((page) => `- ${page}: [sections, word count, media needs]`).join("\n")}

Include copy requirements, image specs, and CTAs for each page.`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 5),
        },
      ];
    },
  },

  // Rule 5: Target Audience Research
  {
    id: "web-design-audience-research",
    name: "Target Audience Research",
    description: "Research target audience and create personas",
    responseKey: "target_audience",
    priority: 8,
    condition: (responses) => {
      return hasTextResponse(responses, "target_audience");
    },
    generateTasks: (responses, context) => {
      const audience = getResponseValue(responses, "target_audience", "");

      return [
        {
          title: "Create user personas",
          description: `Develop detailed user personas for: ${audience}

Include:
- Demographics and psychographics
- Goals and pain points
- User journey mapping
- Device/browser preferences
- Content consumption habits
- Decision-making factors

Create 2-3 primary personas with visual representations.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 5),
        },
        {
          title: "Research competitor websites",
          description: `Analyze competitor websites targeting: ${audience}

Research:
- 5-10 direct competitors
- Design patterns they use
- Content strategy
- UX strengths and weaknesses
- Conversion tactics
- Unique differentiators

Document findings with screenshots and recommendations.`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 6),
        },
      ];
    },
  },

  // Rule 6: Content Strategy
  {
    id: "web-design-content-strategy",
    name: "Content Strategy Development",
    description: "Plan content creation and copywriting",
    responseKey: ["business_description", "brand_personality"],
    priority: 6,
    condition: (responses) => {
      return (
        hasTextResponse(responses, "business_description") ||
        hasTextResponse(responses, "brand_personality")
      );
    },
    generateTasks: (responses, context) => {
      const businessDesc = getResponseValue(responses, "business_description", "");
      const brandPersonality = getResponseValue(responses, "brand_personality", "");

      return [
        {
          title: "Develop brand messaging and tone of voice",
          description: `Create comprehensive brand messaging guide based on:

Business: ${businessDesc}
Personality: ${brandPersonality}

Include:
- Brand voice characteristics
- Do's and don'ts
- Sample copy for different sections
- Headline formulas
- CTA language
- Value proposition statements`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 7),
        },
        {
          title: "Create content wireframes",
          description: `Develop content-focused wireframes showing:
- Content hierarchy
- Section layouts
- Text placement and sizing
- Image/media locations
- CTA positioning
- Trust elements (testimonials, logos, etc.)`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 8),
        },
      ];
    },
  },

  // Rule 7: Technical Requirements
  {
    id: "web-design-technical-setup",
    name: "Technical Setup",
    description: "Set up technical infrastructure",
    responseKey: ["hosting", "domain_name"],
    priority: 7,
    condition: (responses) => {
      return hasTextResponse(responses, "hosting") || hasTextResponse(responses, "domain_name");
    },
    generateTasks: (responses, context) => {
      const hosting = getResponseValue(responses, "hosting", "");
      const domain = getResponseValue(responses, "domain_name", "");

      const tasks = [];

      if (domain) {
        tasks.push({
          title: `Set up domain: ${domain}`,
          description: `Configure domain and DNS:
- Verify domain ownership/availability
- Set up DNS records
- Configure SSL certificate
- Set up email forwarding if needed
- Configure CDN if applicable
- Test domain propagation`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 3),
        });
      }

      if (hosting) {
        tasks.push({
          title: "Configure hosting environment",
          description: `Set up hosting for the project:

Hosting: ${hosting}

Tasks:
- Create hosting account/server
- Configure server settings
- Set up staging environment
- Install necessary software/packages
- Configure backups
- Set up monitoring
- Document access credentials`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 4),
        });
      }

      return tasks;
    },
  },

  // Rule 8: Launch Preparation
  {
    id: "web-design-launch-prep",
    name: "Launch Preparation",
    description: "Prepare for website launch",
    responseKey: "launch_date",
    priority: 5,
    condition: (responses) => {
      return responses.launch_date !== undefined;
    },
    generateTasks: (responses, context) => {
      const launchDate = getResponseValue(responses, "launch_date", null);

      return [
        {
          title: "Create pre-launch checklist",
          description: `Develop comprehensive launch checklist:

Testing:
- Cross-browser testing
- Mobile responsiveness
- Form functionality
- Page load speed
- SEO optimization
- Analytics setup
- Security audit

Content:
- Proofread all copy
- Optimize all images
- Verify all links
- Check metadata

Technical:
- Backup current site
- SSL verification
- 301 redirects if needed
- DNS cutover plan`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: launchDate ? calculateDueDate(new Date(launchDate), -7) : calculateDueDate(context.completionDate, 14),
        },
      ];
    },
  },
];

export default webDesignRules;
