---
mode: agent
---


# Universal Service Landing Page Template

**Create a complete and professional landing page for a service-based business using this customizable template.**

## Business Configuration Template

**Company Information:**
- **Business Name:** [Create an impactful name that combines your service concept with your target market]
- **Industry:** [e.g., "Cleaning Services", "Digital Marketing", "Consulting", "Home Repair", "Healthcare"]
- **Target Market:** [e.g., "Vacation rentals", "Small businesses", "Homeowners", "E-commerce stores"]
- **Service Type:** [e.g., "Maintenance", "Consulting", "Digital Services", "Healthcare"]

## Required Landing Page Structure (Mobile-First Design)

### 1. Header/Navigation
- Professional logo placement
- Clean navigation menu (Services, About, Testimonials, Contact)
- Prominent contact CTA button
- Mobile hamburger menu

### 2. Hero Section
- **Dynamic background:** Carousel with industry-relevant images/videos
- **Compelling headline:** Value proposition in 10 words or less
- **Subheadline:** Brief explanation of your unique service
- **Primary CTA:** Action-oriented button (e.g., "Get Free Quote", "Book Consultation")
- **Trust indicators:** Years of experience, certifications, awards

### 3. Services Section
- **Service categories:** 3-6 main service offerings
- **Service cards:** Icon, title, brief description, "Learn More" link
- **Pricing models:** Transparent pricing structure or "Starting at" prices
- **Service areas:** Geographic coverage or specializations

### 4. Value Proposition
- **Why choose us:** 4-6 key differentiators
- **Problem/Solution:** Pain points you solve
- **Guarantees:** Service warranties, satisfaction guarantees
- **Certifications:** Professional credentials, insurance coverage

### 5. Social Proof Section
- **Customer testimonials:** 6-8 reviews with photos and names
- **Case studies:** Before/after results or success stories
- **Client logos:** Recognizable brands you've served
- **Star ratings:** Overall satisfaction scores

### 6. Visual Portfolio
- **Gallery section:** High-quality work samples
- **Before/after comparisons:** Transformation showcases
- **Video testimonials:** Customer success stories
- **Work process videos:** Behind-the-scenes content

### 7. Process/How It Works
- **Step-by-step workflow:** 3-5 clear process steps
- **Timeline expectations:** How long each step takes
- **What to expect:** Detailed service delivery process
- **Communication:** How you keep clients informed

### 8. Service Area/Coverage
- **Geographic coverage:** Maps or area listings
- **Service radius:** Distance limitations
- **Special locations:** Unique service areas
- **Expansion plans:** Future coverage areas

### 9. Contact/Quote Section
- **Multiple contact methods:** Phone, email, form, chat
- **Quick quote form:** Essential information collection
- **Response time promises:** When clients can expect to hear back
- **Emergency contact:** 24/7 availability if applicable

### 10. Footer
- **Company information:** Address, hours, contact details
- **Quick links:** Privacy policy, terms of service, sitemap
- **Social media:** All relevant platform links
- **Professional affiliations:** Industry associations, BBB rating

## Content Tone & Style Guidelines

**Professional Voice:**
- Authoritative but approachable
- Solution-focused messaging
- Customer-centric language
- Industry expertise demonstration

**Trust Building:**
- Transparency in pricing and process
- Clear communication about expectations
- Professional credentials prominent
- Customer satisfaction emphasis

**Target Audience Focus:**
- Address specific pain points of your market
- Use industry-appropriate terminology
- Highlight relevant experience
- Show understanding of customer needs

## Technical Implementation Requirements

### Core Features
- **Responsive design:** Mobile-first, tablet, desktop optimization
- **Chat widget integration:** n8n webhook-connected chatbot
- **Dynamic Content:** Fetch all page content from a Headless CMS (WordPress/Directus) or a local JSON mock file.
- **Form submissions:** POST to n8n webhook for lead capture
- **Performance optimization:** Fast loading, optimized images
- **SEO foundation:** Meta tags, structured data, clean URLs

### Chat Widget Configuration
```html
<script>
window.ChatWidgetConfig = {
  webhook: { 
    url: 'YOUR_N8N_WEBHOOK_URL', 
    route: 'chat' 
  },
  branding: { 
    name: 'Support',
    logo: 'YOUR_LOGO_URL',
    welcomeText: 'How can we help you today?',
    responseTimeText: 'We typically reply in minutes'
  },
  style: { 
    position: 'right',
    primaryColor: '#YOUR_BRAND_COLOR'
  }
};
</script>
<script src="/davetechai-chat-widget.js"></script>
```

### Quote Form Integration
- **Form fields:** Name, email, phone, service type, message
- **Webhook endpoint:** POST to n8n for CRM integration
- **Validation:** Client-side and server-side validation
- **Thank you page:** Confirmation and next steps

### SEO Optimization
- **Title tags:** Service + Location + Business Name
- **Meta descriptions:** Compelling 155-character summaries
- **Header structure:** Proper H1-H6 hierarchy
- **Schema markup:** LocalBusiness, Service, Review schemas
- **Robots.txt:** Search engine guidance
- **Sitemap.xml:** Complete page structure

## Technology Stack

### Frontend
- **HTML5:** Semantic markup structure
- **Tailwind CSS:** Utility-first styling framework
- **Vanilla JavaScript:** Form handling, interactions
- **CSS Grid/Flexbox:** Layout systems

### Integration Points
- **n8n webhooks:** Form submissions, chat widget
- **Google Analytics:** Traffic and conversion tracking
- **Google Maps:** Service area visualization
- **Social media:** Share buttons, feed integration

## Deliverables Checklist

### Code Files
- [ ] `index.html` - Complete landing page structure
- [ ] `styles.css` - Custom styles complementing Tailwind
- [ ] `script.js` - Interactive functionality
- [ ] `robots.txt` - SEO crawling instructions
- [ ] `sitemap.xml` - Site structure for search engines

### Content Assets
- [ ] Copywriting for all sections
- [ ] Image placeholders with specific descriptions
- [ ] Icon specifications for services
- [ ] Video placeholder descriptions

### Configuration
- [ ] Chat widget setup instructions
- [ ] n8n webhook configuration guide
- [ ] Social media integration guide
- [ ] Analytics implementation guide

## Customization Variables

Replace these placeholders throughout the template:

```javascript
const businessConfig = {
  // Business Details
  businessName: "YOUR_BUSINESS_NAME",
  industry: "YOUR_INDUSTRY",
  tagline: "YOUR_VALUE_PROPOSITION",
  
  // Contact Information
  phone: "YOUR_PHONE_NUMBER",
  email: "YOUR_EMAIL",
  address: "YOUR_ADDRESS",
  
  // Service Details
  services: ["SERVICE_1", "SERVICE_2", "SERVICE_3"],
  serviceArea: "YOUR_SERVICE_AREA",
  
  // Branding
  primaryColor: "#YOUR_PRIMARY_COLOR",
  secondaryColor: "#YOUR_SECONDARY_COLOR",
  logoUrl: "YOUR_LOGO_URL",
  
  // Technical
  webhookUrl: "YOUR_N8N_WEBHOOK_URL",
  analyticsId: "YOUR_GA_ID"
};
```

## Usage Instructions

1. **Copy this template** and replace all placeholder content with your specific business information
2. **Customize the design** using the provided color and styling variables
3. **Configure integrations** following the technical setup guides
4. **Test all functionality** including forms, chat widget, and mobile responsiveness
5. **Deploy and monitor** using the included analytics and tracking setup

This template provides a solid foundation for any service-based business landing page while maintaining flexibility for industry-specific customization.