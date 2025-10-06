/**
 * Software Development - Task Generation Rules
 * Converts software dev onboarding responses into actionable tasks
 */

import {
  TaskGenerationRule,
  calculateDueDate,
  hasTextResponse,
  getResponseValue,
  arrayIncludes,
  hasFileUploads,
} from "../onboarding-task-mapper";

export const softwareDevRules: TaskGenerationRule[] = [
  // Rule 1: Requirements Analysis
  {
    id: "software-requirements-analysis",
    name: "Requirements Documentation",
    description: "Create comprehensive requirements document",
    responseKey: ["project_description", "core_features", "user_stories"],
    priority: 10,
    condition: (responses) => {
      return (
        hasTextResponse(responses, "project_description") ||
        hasTextResponse(responses, "core_features") ||
        hasTextResponse(responses, "user_stories")
      );
    },
    generateTasks: (responses, context) => {
      const projectDesc = getResponseValue(responses, "project_description", "");
      const coreFeatures = getResponseValue(responses, "core_features", "");

      return [
        {
          title: "Create technical requirements document (TRD)",
          description: `Develop comprehensive TRD based on:

Project: ${projectDesc}
Core Features: ${coreFeatures}

Include:
- Functional requirements
- Non-functional requirements (performance, security, scalability)
- System architecture overview
- Data models and schemas
- API specifications
- Integration requirements
- Success criteria and KPIs

Get stakeholder approval before proceeding.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 5),
        },
        {
          title: "Create user stories and acceptance criteria",
          description: `Break down requirements into user stories:
- Write user stories in "As a [user], I want [goal], so that [benefit]" format
- Define acceptance criteria for each story
- Prioritize using MoSCoW method
- Estimate story points
- Create product backlog

Organize in project management tool.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 6),
        },
      ];
    },
  },

  // Rule 2: Technical Stack Selection
  {
    id: "software-tech-stack",
    name: "Technology Stack Decision",
    description: "Research and select appropriate technologies",
    responseKey: ["tech_preferences", "platform", "programming_language"],
    priority: 9,
    condition: (responses) => {
      return (
        hasTextResponse(responses, "tech_preferences") ||
        hasTextResponse(responses, "platform") ||
        hasTextResponse(responses, "programming_language")
      );
    },
    generateTasks: (responses, context) => {
      const techPref = getResponseValue(responses, "tech_preferences", "");
      const platform = getResponseValue(responses, "platform", "");

      return [
        {
          title: "Finalize technology stack",
          description: `Research and document tech stack decision:

Preferences: ${techPref}
Platform: ${platform}

Document:
- Frontend framework and libraries
- Backend framework and language
- Database selection
- Hosting/cloud provider
- CI/CD pipeline tools
- Third-party services
- Development tools

Include rationale for each choice and alternatives considered.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 4),
        },
        {
          title: "Set up development environment",
          description: `Configure standardized dev environment:
- Version control setup (Git repository)
- Branch strategy
- Code style guide and linting rules
- Environment variables management
- Local development setup guide
- Docker containerization
- Documentation tools

Create README with setup instructions.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 7),
        },
      ];
    },
  },

  // Rule 3: System Architecture
  {
    id: "software-architecture",
    name: "System Architecture Design",
    description: "Design system architecture and data models",
    responseKey: ["architecture_type", "scalability_requirements"],
    priority: 9,
    condition: (responses) => {
      return (
        hasTextResponse(responses, "architecture_type") ||
        hasTextResponse(responses, "scalability_requirements") ||
        hasTextResponse(responses, "core_features")
      );
    },
    generateTasks: (responses, context) => {
      const archType = getResponseValue(responses, "architecture_type", "");
      const scalability = getResponseValue(responses, "scalability_requirements", "");

      return [
        {
          title: "Create system architecture diagram",
          description: `Design high-level and detailed architecture:

Architecture Type: ${archType}
Scalability Needs: ${scalability}

Create diagrams for:
- System components and their relationships
- Data flow diagrams
- API architecture
- Database schema
- Authentication/authorization flow
- Caching strategy
- Load balancing approach
- Microservices boundaries (if applicable)

Use tools like Lucidchart, Draw.io, or Miro.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 7),
        },
        {
          title: "Design database schema",
          description: `Create comprehensive database design:
- Entity-relationship diagrams
- Table structures with field types
- Indexes and constraints
- Relationships and foreign keys
- Migration strategy
- Backup and recovery plan
- Performance optimization notes

Review for normalization and scalability.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 8),
        },
      ];
    },
  },

  // Rule 4: API Design
  {
    id: "software-api-design",
    name: "API Design and Documentation",
    description: "Design and document API endpoints",
    responseKey: ["integration_requirements", "third_party_apis"],
    priority: 8,
    condition: (responses) => {
      return (
        hasTextResponse(responses, "integration_requirements") ||
        hasTextResponse(responses, "third_party_apis") ||
        hasTextResponse(responses, "core_features")
      );
    },
    generateTasks: (responses, context) => {
      const integrations = getResponseValue(responses, "integration_requirements", "");

      return [
        {
          title: "Design REST/GraphQL API specification",
          description: `Create complete API specification:

Integrations Needed: ${integrations}

Document:
- All endpoints with methods (GET, POST, PUT, DELETE)
- Request/response schemas
- Authentication methods
- Rate limiting rules
- Error codes and handling
- Versioning strategy
- Webhook implementations

Use OpenAPI/Swagger or GraphQL schema.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 9),
        },
        {
          title: "Set up API documentation and testing tools",
          description: `Configure API development tools:
- Swagger/Postman collections
- API testing framework
- Mock API endpoints for frontend development
- API gateway configuration
- Monitoring and logging
- Documentation auto-generation

Create comprehensive API docs for team and future clients.`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 10),
        },
      ];
    },
  },

  // Rule 5: Security Implementation
  {
    id: "software-security",
    name: "Security Audit and Implementation",
    description: "Implement security best practices",
    responseKey: ["security_requirements", "compliance_needs", "user_data_handling"],
    priority: 10,
    condition: (responses) => {
      return (
        hasTextResponse(responses, "security_requirements") ||
        hasTextResponse(responses, "compliance_needs") ||
        hasTextResponse(responses, "user_data_handling")
      );
    },
    generateTasks: (responses, context) => {
      const securityReqs = getResponseValue(responses, "security_requirements", "");
      const compliance = getResponseValue(responses, "compliance_needs", "");

      return [
        {
          title: "Implement security measures",
          description: `Set up comprehensive security:

Requirements: ${securityReqs}
Compliance: ${compliance}

Implement:
- Authentication (OAuth, JWT, sessions)
- Authorization and role-based access control
- Data encryption (at rest and in transit)
- Input validation and sanitization
- SQL injection prevention
- XSS and CSRF protection
- Rate limiting
- Security headers
- Dependency vulnerability scanning

Document all security measures.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 12),
        },
        {
          title: "Create security audit checklist",
          description: `Develop ongoing security procedures:
- Penetration testing plan
- Vulnerability disclosure policy
- Incident response plan
- Regular dependency updates
- Security code review guidelines
- Data backup and recovery testing
- Access control audit schedule

Schedule quarterly security reviews.`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 14),
        },
      ];
    },
  },

  // Rule 6: Testing Strategy
  {
    id: "software-testing",
    name: "Testing Framework Setup",
    description: "Implement comprehensive testing strategy",
    responseKey: ["quality_requirements", "test_coverage_target"],
    priority: 7,
    condition: (responses) => {
      return true; // Always create testing tasks for software projects
    },
    generateTasks: (responses, context) => {
      return [
        {
          title: "Set up testing framework",
          description: `Implement multi-layer testing:

Unit Tests:
- Choose testing framework (Jest, Mocha, pytest, etc.)
- Set coverage targets (minimum 80%)
- Configure test runners
- Write test utilities and fixtures

Integration Tests:
- API endpoint testing
- Database integration tests
- Third-party service mocks

E2E Tests:
- Choose E2E framework (Cypress, Playwright, Selenium)
- Define critical user flows
- Set up CI/CD integration

Document testing conventions.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 10),
        },
        {
          title: "Implement CI/CD pipeline",
          description: `Set up automated deployment pipeline:
- Configure CI/CD platform (GitHub Actions, GitLab CI, Jenkins)
- Automate test execution
- Set up staging and production environments
- Configure automated builds
- Implement deployment strategies (blue-green, canary)
- Add rollback procedures
- Set up deployment notifications

Test pipeline with sample deployments.`,
          status: "todo" as const,
          priority: "high" as const,
          dueDate: calculateDueDate(context.completionDate, 15),
        },
      ];
    },
  },

  // Rule 7: Documentation
  {
    id: "software-documentation",
    name: "Documentation Creation",
    description: "Create comprehensive project documentation",
    responseKey: "project_description",
    priority: 5,
    condition: (responses) => {
      return true; // Always create documentation tasks
    },
    generateTasks: (responses, context) => {
      return [
        {
          title: "Create technical documentation",
          description: `Develop comprehensive docs:

Developer Documentation:
- Setup and installation guide
- Architecture overview
- Code structure and conventions
- API reference
- Database schema docs
- Deployment procedures

User Documentation:
- User guides
- Admin panel documentation
- Troubleshooting guides
- FAQ

Use docs framework like Docusaurus, GitBook, or Notion.`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 20),
        },
      ];
    },
  },

  // Rule 8: Performance Optimization
  {
    id: "software-performance",
    name: "Performance Optimization",
    description: "Optimize application performance",
    responseKey: ["performance_requirements", "expected_load"],
    priority: 6,
    condition: (responses) => {
      return (
        hasTextResponse(responses, "performance_requirements") ||
        hasTextResponse(responses, "expected_load")
      );
    },
    generateTasks: (responses, context) => {
      const perfReqs = getResponseValue(responses, "performance_requirements", "");
      const expectedLoad = getResponseValue(responses, "expected_load", "");

      return [
        {
          title: "Implement performance monitoring",
          description: `Set up performance tracking:

Requirements: ${perfReqs}
Expected Load: ${expectedLoad}

Implement:
- Application performance monitoring (APM)
- Database query optimization
- Caching strategy (Redis, CDN)
- Asset optimization
- Lazy loading
- Load testing
- Performance budgets
- Real user monitoring (RUM)

Set up alerts for performance degradation.`,
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: calculateDueDate(context.completionDate, 18),
        },
      ];
    },
  },
];

export default softwareDevRules;
