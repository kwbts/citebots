# Reporting Implementation

## Overview

The Reporting feature provides visualization and analysis of citation data collected by the system. This document outlines the implementation details of this feature.

## Architecture

### Components

1. **Report Generator**
   - Creates report structure
   - Assembles data from multiple sources
   - Formats reports for presentation

2. **Visualization Engine**
   - Generates charts and graphs
   - Creates interactive visualizations
   - Provides data exploration tools

3. **Data Aggregator**
   - Processes raw citation data
   - Calculates metrics and KPIs
   - Performs trend analysis

4. **Export Manager**
   - Generates PDF reports
   - Creates data exports
   - Manages sharing functionality

## Implementation Details

### Report Generation

```javascript
// Simplified report generation logic
async function generateReport(clientId, parameters) {
  try {
    // Fetch client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*, competitors(*)')
      .eq('id', clientId)
      .single();
    
    if (clientError) throw clientError;
    
    // Fetch citation data
    const { data: citations, error: citationsError } = await supabase
      .from('citations')
      .select(`
        *,
        response:responses(*),
        query:responses(query:queries(*))
      `)
      .eq('client_id', clientId);
    
    if (citationsError) throw citationsError;
    
    // Process data based on report type
    let reportData;
    
    switch (parameters.type) {
      case 'brand':
        reportData = processBrandReportData(client, citations);
        break;
      case 'product':
        reportData = processProductReportData(client, citations);
        break;
      case 'informational':
        reportData = processInformationalReportData(client, citations);
        break;
      default:
        reportData = processStandardReportData(client, citations);
    }
    
    // Generate report structure
    const report = {
      id: uuidv4(),
      client: client,
      type: parameters.type,
      generated_at: new Date().toISOString(),
      data: reportData,
      summary: generateSummary(reportData)
    };
    
    // Store report in database
    const { data: savedReport, error: saveError } = await supabase
      .from('reports')
      .insert({
        client_id: clientId,
        type: parameters.type,
        data: report
      })
      .single();
    
    if (saveError) throw saveError;
    
    return savedReport;
  } catch (error) {
    console.error('Error generating report:', error.message);
    throw error;
  }
}
```

### Data Visualization

```javascript
// Simplified visualization logic
function createVisualizations(reportData) {
  const visualizations = {
    citationsByDomain: createCitationsByDomainChart(reportData),
    citationsByIntent: createCitationsByIntentChart(reportData),
    topQueries: createTopQueriesChart(reportData),
    competitorComparison: createCompetitorComparisonChart(reportData),
    trendOverTime: createTrendOverTimeChart(reportData)
  };
  
  return visualizations;
}

// Helper function to create citation by domain chart
function createCitationsByDomainChart(reportData) {
  // Extract domains and citation counts
  const domains = [];
  const counts = [];
  
  for (const domain in reportData.citationsByDomain) {
    domains.push(domain);
    counts.push(reportData.citationsByDomain[domain]);
  }
  
  // Create chart configuration
  return {
    type: 'bar',
    data: {
      labels: domains,
      datasets: [{
        label: 'Citations',
        data: counts,
        backgroundColor: generateColorPalette(domains.length)
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: true,
        text: 'Citations by Domain'
      }
    }
  };
}
```

### Report Types

#### Basic Report Triad

**Brand Report**
```javascript
// Simplified brand report processing
function processBrandReportData(client, citations) {
  return {
    citationsByDomain: countCitationsByDomain(citations),
    brandPerception: analyzeBrandPerception(citations, client),
    competitivePositioning: analyzeCompetitivePositioning(citations, client),
    brandQueries: extractBrandQueries(citations),
    recommendations: generateBrandRecommendations(citations, client)
  };
}
```

**Product Report**
```javascript
// Simplified product report processing
function processProductReportData(client, citations) {
  return {
    featureCitations: analyzeFeatureCitations(citations, client),
    competitorFeatures: analyzeCompetitorFeatures(citations, client),
    productPerception: analyzeProductPerception(citations, client),
    marketPositioning: analyzeMarketPositioning(citations, client),
    recommendations: generateProductRecommendations(citations, client)
  };
}
```

**Informational Report**
```javascript
// Simplified informational report processing
function processInformationalReportData(client, citations) {
  return {
    contentGaps: identifyContentGaps(citations, client),
    topContent: identifyTopContent(citations, client),
    contentFreshness: analyzeContentFreshness(citations, client),
    contentRelevance: analyzeContentRelevance(citations, client),
    recommendations: generateContentRecommendations(citations, client)
  };
}
```

## Database Schema

### Tables

- `reports`: Stores generated reports
- `report_shares`: Tracks report sharing
- `visualizations`: Stores visualization configurations
- `dashboards`: Stores custom dashboard configurations

### Key Relationships

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  type TEXT NOT NULL,
  name TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE report_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id),
  access_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE visualizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE dashboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  name TEXT NOT NULL,
  layout JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE dashboard_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dashboard_id UUID REFERENCES dashboards(id),
  visualization_id UUID REFERENCES visualizations(id),
  position JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Report Management

- `POST /api/reports`: Generate new report
- `GET /api/reports`: List reports
- `GET /api/reports/{id}`: Get report details
- `DELETE /api/reports/{id}`: Delete report

### Visualization

- `GET /api/reports/{id}/visualizations`: Get report visualizations
- `POST /api/visualizations`: Create custom visualization
- `PUT /api/visualizations/{id}`: Update visualization
- `DELETE /api/visualizations/{id}`: Delete visualization

### Dashboards

- `POST /api/dashboards`: Create dashboard
- `GET /api/dashboards`: List dashboards
- `GET /api/dashboards/{id}`: Get dashboard details
- `PUT /api/dashboards/{id}`: Update dashboard
- `DELETE /api/dashboards/{id}`: Delete dashboard

### Export and Sharing

- `GET /api/reports/{id}/export/{format}`: Export report
- `POST /api/reports/{id}/share`: Create share link
- `DELETE /api/reports/{id}/share/{token}`: Delete share link

## UI Components

- Report selection interface
- Visualization components
- Dashboard builder
- Export and sharing controls

## Advanced Features

### Persona-Based Analysis

Future implementation will include segmentation by buyer persona:

- Persona definition interface
- Query categorization by persona
- Persona-specific recommendations
- Targeted content suggestions

### Customer Journey Analysis

Future implementation will map analysis to customer journey stages:

- Journey stage definition
- Query mapping to journey stages
- Stage-specific performance metrics
- Journey optimization recommendations

## Validation Status

As outlined in the [Third Validation Milestone](../../validation/third-milestone.md), the basic reporting functionality has been implemented with the initial dashboard visualization of key information.