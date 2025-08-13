import { ref, computed } from 'vue';

interface BriefParams {
  clientId?: string;
  title: string;
  keywords: string[];
  purpose: string;
  audience: string;
  styleGuide?: string;
  customInstructions?: string;
  researchDepth: string;
  platforms: {
    chatGpt: boolean;
    perplexity: boolean;
    google: boolean;
  };
}

interface Brief {
  id: string;
  title: string;
  client?: {
    id: string;
    name: string;
    domain: string;
  };
  keywords: string[];
  purpose: string;
  audience: string;
  generated_at: string;
  
  // Strategic fields for writer guidance
  strategic_overview?: string;
  content_differentiation?: string;
  specificity_requirements?: string;
  brand_voice_guidelines?: string;
  competitive_landscape_analysis?: string;
  quotable_statistics?: Array<{
    statistic: string;
    source: string;
    context: string;
  }>;
  unique_value_propositions?: Array<string>;
  
  // Legacy/standard fields
  summary: string;
  table_of_contents: Array<{
    title: string;
    points: string[];
  }>;
  research_links: Array<{
    title: string;
    url: string;
    description: string;
    source_type: string;
  }>;
  process_notes: {
    llm_responses: string[];
    search_results: string[];
    competitor_insights: string[];
  };
  meta: {
    research_stats: {
      llm_queries_executed: number;
      pages_analyzed: number;
      competitor_pages_analyzed: number;
    }
  };
  status: string;
}

// Brief generator server URL - this would typically come from an environment variable
const apiUrl = 'http://localhost:3001'; // Default for local development
const supabaseApiUrl = 'https://trmaeodthlywcjwfzdka.supabase.co'; // Supabase URL for direct DB access fallback

// Debug flag to log detailed API communication
const DEBUG_API = true;

export function useBriefGenerator() {
  const isGenerating = ref(false);
  const currentBrief = ref<Brief | null>(null);
  const error = ref<string | null>(null);
  const user = useSupabaseUser();
  const supabase = useSupabaseClient();
  
  // Generate a brief
  async function generateBrief(params: BriefParams): Promise<string | null> {
    isGenerating.value = true;
    error.value = null;
    
    try {
      console.log('Generating brief with params:', params);
      
      // Get authenticated user's token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Authentication required');
      }
      
      // Add user ID to params
      const requestParams = {
        ...params,
        userId: user.value?.id
      };
      
      // Send request to brief generator API
      const response = await fetch(`${apiUrl}/generate-brief`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify(requestParams)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Brief generation server error:', errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Brief generation response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Error generating brief');
      }
      
      return data.briefId;
    } catch (err: any) {
      console.error('Brief generation error:', err);
      error.value = err.message || 'Error generating brief';
      return null;
    } finally {
      isGenerating.value = false;
    }
  }
  
  // Get a brief by ID
  async function getBrief(id: string): Promise<Brief | null> {
    error.value = null;

    try {
      if (DEBUG_API) console.log('Fetching brief:', id);

      // Get authenticated user's token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Authentication required');
      }

      // First try fetching directly from the API server
      try {
        if (DEBUG_API) console.log('Attempting to fetch from API server:', `${apiUrl}/brief/${id}`);

        const response = await fetch(`${apiUrl}/brief/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionData.session.access_token}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { error: errorText };
          }

          if (DEBUG_API) console.error('Brief fetch server error:', errorData);
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        if (DEBUG_API) console.log('Brief fetch response from API:', data);

        if (!data.success) {
          throw new Error(data.error || 'Error fetching brief');
        }

        // Format the brief from API response to match expected structure
        const formattedBrief: Brief = {
          id: data.brief.id,
          title: data.brief.title,
          client: data.brief.client || (data.brief.client_id ? {
            id: data.brief.client_id,
            name: 'Client',
            domain: ''
          } : undefined),
          keywords: data.brief.keywords || [],
          purpose: data.brief.purpose || '',
          audience: data.brief.audience || '',
          generated_at: data.brief.created_at || data.brief.generated_at,
          
          // Strategic fields
          strategic_overview: data.brief.strategic_overview || data.brief.content?.strategic_overview || '',
          content_differentiation: data.brief.content_differentiation || data.brief.content?.content_differentiation || '',
          specificity_requirements: data.brief.specificity_requirements || data.brief.content?.specificity_requirements || '',
          brand_voice_guidelines: data.brief.brand_voice_guidelines || data.brief.content?.brand_voice_guidelines || '',
          competitive_landscape_analysis: data.brief.competitive_landscape_analysis || data.brief.content?.competitive_landscape_analysis || '',
          quotable_statistics: data.brief.quotable_statistics || data.brief.content?.quotable_statistics || [],
          unique_value_propositions: data.brief.unique_value_propositions || data.brief.content?.unique_value_propositions || [],
          
          // Legacy fields
          summary: data.brief.content?.summary || '',
          table_of_contents: data.brief.content?.table_of_contents || [],
          research_links: data.brief.content?.research_links || [],
          process_notes: data.brief.content?.process_notes || {
            llm_responses: [],
            search_results: [],
            competitor_insights: []
          },
          meta: data.brief.content?.meta || {
            research_stats: {
              llm_queries_executed: 0,
              pages_analyzed: 0,
              competitor_pages_analyzed: 0
            }
          },
          status: data.brief.status
        };

        currentBrief.value = formattedBrief;
        return formattedBrief;
      } catch (apiError) {
        // If API server fails, fall back to direct Supabase fetch
        if (DEBUG_API) console.warn('API server fetch failed, trying direct Supabase:', apiError);

        const { data: brief, error: supabaseError } = await supabase
          .from('content_briefs')
          .select('*')
          .eq('id', id)
          .single();

        if (supabaseError) {
          throw new Error(`Database error: ${supabaseError.message}`);
        }

        if (!brief) {
          throw new Error('Brief not found');
        }

        if (DEBUG_API) console.log('Brief fetch response from Supabase:', brief);

        // Fetch client data if brief has a client_id
        let clientData: { id: string; name: string; domain: string; } | undefined = undefined;
        if (brief.client_id) {
          const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('id, name, domain')
            .eq('id', brief.client_id)
            .single();
          
          if (!clientError && client) {
            clientData = {
              id: client.id,
              name: client.name,
              domain: client.domain || ''
            };
          }
        }

        // Convert Supabase brief to the expected format
        const formattedBrief: Brief = {
          id: brief.id,
          title: brief.title,
          client: clientData,
          keywords: brief.keywords || [],
          purpose: brief.purpose || '',
          audience: brief.audience || '',
          generated_at: brief.created_at,
          
          // Strategic fields
          strategic_overview: brief.strategic_overview || brief.content?.strategic_overview || '',
          content_differentiation: brief.content_differentiation || brief.content?.content_differentiation || '',
          specificity_requirements: brief.specificity_requirements || brief.content?.specificity_requirements || '',
          brand_voice_guidelines: brief.brand_voice_guidelines || brief.content?.brand_voice_guidelines || '',
          quotable_statistics: brief.quotable_statistics || brief.content?.quotable_statistics || [],
          unique_value_propositions: brief.unique_value_propositions || brief.content?.unique_value_propositions || [],
          
          // Legacy fields
          summary: brief.content?.summary || '',
          table_of_contents: brief.content?.table_of_contents || [],
          research_links: brief.content?.research_links || [],
          process_notes: brief.content?.process_notes || {
            llm_responses: [],
            search_results: [],
            competitor_insights: []
          },
          meta: brief.content?.meta || {
            research_stats: {
              llm_queries_executed: 0,
              pages_analyzed: 0,
              competitor_pages_analyzed: 0
            }
          },
          status: brief.status
        };

        currentBrief.value = formattedBrief;
        return formattedBrief;
      }
    } catch (err: any) {
      console.error('Brief fetch error:', err);
      error.value = err.message || 'Error fetching brief';
      return null;
    }
  }
  
  // List briefs with optional filtering
  async function listBriefs(filters: any = {}): Promise<Brief[]> {
    error.value = null;

    try {
      if (DEBUG_API) console.log('Listing briefs with filters:', filters);

      // Get authenticated user's token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Authentication required');
      }

      // Try the API server first
      try {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });

        if (DEBUG_API) console.log('Attempting to fetch from API server:', `${apiUrl}/briefs?${queryParams.toString()}`);

        const response = await fetch(`${apiUrl}/briefs?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionData.session.access_token}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { error: errorText };
          }

          if (DEBUG_API) console.error('Brief list server error:', errorData);
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        if (DEBUG_API) console.log('Brief list response from API:', data);

        if (!data.success) {
          throw new Error(data.error || 'Error listing briefs');
        }

        // Format the briefs from API response to match expected structure
        return data.briefs.map((brief: any) => ({
          id: brief.id,
          title: brief.title,
          client: brief.client || (brief.client_id ? {
            id: brief.client_id,
            name: 'Client',
            domain: ''
          } : undefined),
          keywords: brief.keywords || [],
          purpose: brief.purpose || '',
          audience: brief.audience || '',
          generated_at: brief.created_at || brief.generated_at,
          
          // Strategic fields
          strategic_overview: brief.strategic_overview || brief.content?.strategic_overview || '',
          content_differentiation: brief.content_differentiation || brief.content?.content_differentiation || '',
          specificity_requirements: brief.specificity_requirements || brief.content?.specificity_requirements || '',
          brand_voice_guidelines: brief.brand_voice_guidelines || brief.content?.brand_voice_guidelines || '',
          quotable_statistics: brief.quotable_statistics || brief.content?.quotable_statistics || [],
          unique_value_propositions: brief.unique_value_propositions || brief.content?.unique_value_propositions || [],
          
          // Legacy fields
          summary: brief.content?.summary || '',
          table_of_contents: brief.content?.table_of_contents || [],
          research_links: brief.content?.research_links || [],
          process_notes: brief.content?.process_notes || {
            llm_responses: [],
            search_results: [],
            competitor_insights: []
          },
          meta: brief.content?.meta || {
            research_stats: {
              llm_queries_executed: 0,
              pages_analyzed: 0,
              competitor_pages_analyzed: 0
            }
          },
          status: brief.status
        }));
      } catch (apiError) {
        // If API server fails, fall back to direct Supabase fetch
        if (DEBUG_API) console.warn('API server fetch failed, trying direct Supabase:', apiError);

        // Construct query
        let query = supabase
          .from('content_briefs')
          .select('*')
          .order('created_at', { ascending: false });

        // Apply filters
        if (filters.client_id) {
          query = query.eq('client_id', filters.client_id);
        }

        if (filters.status) {
          query = query.eq('status', filters.status);
        }

        if (filters.created_by) {
          query = query.eq('created_by', filters.created_by);
        }

        // Execute query
        const { data: briefs, error: supabaseError } = await query;

        if (supabaseError) {
          throw new Error(`Database error: ${supabaseError.message}`);
        }

        if (!briefs || briefs.length === 0) {
          return [];
        }

        if (DEBUG_API) console.log('Brief list response from Supabase:', briefs.length);

        // Get unique client IDs
        const clientIds = [...new Set(briefs.filter(b => b.client_id).map(b => b.client_id))];
        
        // Fetch client data if there are any client IDs
        let clientMap = new Map();
        if (clientIds.length > 0) {
          const { data: clients, error: clientError } = await supabase
            .from('clients')
            .select('id, name, domain')
            .in('id', clientIds);
          
          if (!clientError && clients) {
            clients.forEach(client => {
              clientMap.set(client.id, client);
            });
          }
        }

        // Format briefs to match expected structure
        return briefs.map(brief => ({
          id: brief.id,
          title: brief.title,
          client: brief.client_id && clientMap.has(brief.client_id) ? {
            id: brief.client_id,
            name: clientMap.get(brief.client_id).name,
            domain: clientMap.get(brief.client_id).domain || ''
          } : undefined,
          keywords: brief.keywords || [],
          purpose: brief.purpose || '',
          audience: brief.audience || '',
          generated_at: brief.created_at,
          
          // Strategic fields
          strategic_overview: brief.strategic_overview || brief.content?.strategic_overview || '',
          content_differentiation: brief.content_differentiation || brief.content?.content_differentiation || '',
          specificity_requirements: brief.specificity_requirements || brief.content?.specificity_requirements || '',
          brand_voice_guidelines: brief.brand_voice_guidelines || brief.content?.brand_voice_guidelines || '',
          quotable_statistics: brief.quotable_statistics || brief.content?.quotable_statistics || [],
          unique_value_propositions: brief.unique_value_propositions || brief.content?.unique_value_propositions || [],
          
          // Legacy fields
          summary: brief.content?.summary || '',
          table_of_contents: brief.content?.table_of_contents || [],
          research_links: brief.content?.research_links || [],
          process_notes: brief.content?.process_notes || {
            llm_responses: [],
            search_results: [],
            competitor_insights: []
          },
          meta: brief.content?.meta || {
            research_stats: {
              llm_queries_executed: 0,
              pages_analyzed: 0,
              competitor_pages_analyzed: 0
            }
          },
          status: brief.status
        }));
      }
    } catch (err: any) {
      console.error('Brief list error:', err);
      error.value = err.message || 'Error listing briefs';
      return [];
    }
  }
  
  // Get brief status
  async function getBriefStatus(id: string): Promise<string> {
    try {
      if (DEBUG_API) console.log('Checking brief status:', id);

      // Get authenticated user's token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Authentication required');
      }

      // Try the API server first
      try {
        if (DEBUG_API) console.log('Attempting to fetch status from API:', `${apiUrl}/brief/${id}/status`);

        const response = await fetch(`${apiUrl}/brief/${id}/status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionData.session.access_token}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { error: errorText };
          }

          if (DEBUG_API) console.error('Brief status check error:', errorData);
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        if (DEBUG_API) console.log('Brief status response from API:', data);

        if (!data.success) {
          throw new Error(data.error || 'Error checking brief status');
        }

        return data.status;
      } catch (apiError) {
        // If API server fails, fall back to direct Supabase fetch
        if (DEBUG_API) console.warn('API status check failed, trying direct Supabase:', apiError);

        const { data: brief, error: supabaseError } = await supabase
          .from('content_briefs')
          .select('status')
          .eq('id', id)
          .single();

        if (supabaseError) {
          throw new Error(`Database error: ${supabaseError.message}`);
        }

        if (!brief) {
          throw new Error('Brief not found');
        }

        if (DEBUG_API) console.log('Brief status from Supabase:', brief.status);
        return brief.status;
      }
    } catch (err: any) {
      console.error('Brief status check error:', err);
      error.value = err.message || 'Error checking brief status';
      return 'error';
    }
  }
  
  // Export formatted brief for various formats
  function exportBrief(format: 'pdf' | 'docx' | 'text'): void {
    if (!currentBrief.value) {
      error.value = 'No brief to export';
      return;
    }

    if (format === 'text') {
      // Simple text export to clipboard
      const textContent = formatBriefAsText(currentBrief.value);
      navigator.clipboard.writeText(textContent)
        .then(() => {
          alert('Brief copied to clipboard');
        })
        .catch(err => {
          error.value = 'Failed to copy to clipboard';
          console.error(err);
        });
    } else {
      // For PDF and DOCX, we should use a server endpoint
      // Since the export endpoint might not exist, we'll handle it gracefully
      try {
        if (DEBUG_API) console.log(`Attempting to export as ${format}`);

        // First check if the API server is accessible
        fetch(`${apiUrl}/health`)
          .then(response => {
            if (response.ok) {
              // API server is up, try to use export endpoint
              window.open(`${apiUrl}/brief/${currentBrief.value!.id}/export/${format}`, '_blank');
            } else {
              // API server is not responding properly
              throw new Error('Export server is not available');
            }
          })
          .catch(err => {
            // If API server is down, use a fallback approach
            if (DEBUG_API) console.warn('Export server unavailable, using fallback export', err);

            // Create a basic HTML representation and open in new tab
            const content = formatBriefAsHtml(currentBrief.value!);
            const blob = new Blob([content], {type: 'text/html'});
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          });
      } catch (err: any) {
        error.value = `Failed to export as ${format.toUpperCase()}`;
        console.error(err);
      }
    }
  }

  // Format brief as HTML for export fallback
  function formatBriefAsHtml(brief: Brief): string {
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${brief.title} - Content Brief</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          h2 { color: #555; margin-top: 20px; }
          h3 { color: #777; }
          .suggestion { margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px; }
          .importance { display: inline-block; height: 10px; background: orange; border-radius: 5px; }
          .toc-section { margin-bottom: 20px; border-left: 3px solid orange; padding-left: 15px; }
          .link { margin-bottom: 10px; }
          footer { margin-top: 50px; font-size: 12px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <h1>${brief.title}</h1>
        <p><strong>Generated:</strong> ${new Date(brief.generated_at).toLocaleString()}</p>

        <h2>Strategic Overview</h2>
        <p>${brief.strategic_overview || brief.summary}</p>

        ${brief.brand_voice_guidelines ? `<h2>Brand Voice Guidelines</h2><p>${brief.brand_voice_guidelines}</p>` : ''}
        
        ${brief.specificity_requirements ? `<h2>Specificity Requirements</h2><p>${brief.specificity_requirements}</p>` : ''}

        <h2>Quotable Statistics</h2>
    `;

    if (brief.quotable_statistics?.length) {
      brief.quotable_statistics.forEach((stat, index) => {
        html += `
          <div class="suggestion">
            <h3>"${stat.statistic}"</h3>
            <p><strong>Source:</strong> ${stat.source}</p>
            <p><strong>Context:</strong> ${stat.context}</p>
          </div>
        `;
      });
    } else {
      html += `<p>No quotable statistics available</p>`;
    }

    html += `<h2>Table of Contents</h2>`;

    brief.table_of_contents.forEach(section => {
      html += `
        <div class="toc-section">
          <h3>${section.title}</h3>
          <ul>
      `;

      section.points.forEach(point => {
        html += `<li>${point}</li>`;
      });

      html += `
          </ul>
        </div>
      `;
    });

    html += `<h2>Research Links</h2>`;

    brief.research_links.forEach(link => {
      html += `
        <div class="link">
          <p><a href="${link.url}" target="_blank">${link.title}</a></p>
          <p>${link.description}</p>
          <p><small>${link.source_type}</small></p>
        </div>
      `;
    });

    // Add process notes for detailed export
    if (brief.process_notes?.debug_info) {
      html += `<h2>Process Notes & Debug Information</h2>`;
      
      const debugInfo = brief.process_notes.debug_info;
      
      html += `<h3>Generation Statistics</h3>`;
      html += `<ul>`;
      if (debugInfo.processing_steps) {
        debugInfo.processing_steps.forEach(step => {
          html += `<li><strong>${step.step}:</strong> ${step.status} ${step.timing ? `(${JSON.stringify(step.timing)})` : ''}</li>`;
        });
      }
      html += `</ul>`;
      
      if (debugInfo.full_llm_responses?.length) {
        html += `<h3>LLM Research Responses</h3>`;
        debugInfo.full_llm_responses.forEach((response, idx) => {
          html += `
            <div style="border: 1px solid #ddd; margin: 10px 0; padding: 10px;">
              <h4>${response.platform} Query ${idx + 1}</h4>
              <p><strong>Query:</strong> ${response.query}</p>
              <p><strong>Response Length:</strong> ${response.response_length} characters</p>
              <p><strong>Citations:</strong> ${response.citations_count}</p>
              <p><strong>Status:</strong> ${response.success ? 'Success' : 'Failed'}</p>
            </div>
          `;
        });
      }
      
      if (debugInfo.page_analysis?.length) {
        html += `<h3>Page Analysis Results</h3>`;
        html += `<table border="1" style="width: 100%; border-collapse: collapse;">`;
        html += `<tr><th>URL</th><th>Status</th><th>Title</th><th>Content Length</th></tr>`;
        debugInfo.page_analysis.forEach(page => {
          html += `<tr><td>${page.url}</td><td>${page.status}</td><td>${page.title}</td><td>${page.content_length}</td></tr>`;
        });
        html += `</table>`;
      }
    }

    html += `
        <footer>
          Generated by Citebots Brief Generator on ${new Date().toLocaleDateString()}
        </footer>
      </body>
      </html>
    `;

    return html;
  }
  
  // Format brief as text for clipboard
  function formatBriefAsText(brief: Brief): string {
    let text = `# ${brief.title}\n\n`;
    
    text += `## Strategic Overview\n\n${brief.strategic_overview || brief.summary}\n\n`;
    
    if (brief.brand_voice_guidelines) {
      text += `## Brand Voice Guidelines\n\n${brief.brand_voice_guidelines}\n\n`;
    }
    
    if (brief.specificity_requirements) {
      text += `## Specificity Requirements\n\n${brief.specificity_requirements}\n\n`;
    }
    
    text += `## Quotable Statistics\n\n`;
    if (brief.quotable_statistics?.length) {
      brief.quotable_statistics.forEach((stat, index) => {
        text += `${index+1}. "${stat.statistic}" - ${stat.source}\n`;
        text += `   Context: ${stat.context}\n\n`;
      });
    } else {
      text += 'No quotable statistics available\n\n';
    }
    
    text += `## Table of Contents\n\n`;
    brief.table_of_contents.forEach(section => {
      text += `${section.title}\n`;
      section.points.forEach(point => {
        text += `- ${point}\n`;
      });
      text += '\n';
    });
    
    text += `## Research Links\n\n`;
    brief.research_links.forEach(link => {
      text += `- [${link.title}](${link.url})\n`;
      text += `  ${link.description}\n\n`;
    });
    
    // Add process notes summary for detailed export
    if (brief.process_notes?.debug_info) {
      text += `## Generation Details\n\n`;
      const debugInfo = brief.process_notes.debug_info;
      
      if (debugInfo.processing_steps) {
        text += `### Processing Steps:\n`;
        debugInfo.processing_steps.forEach(step => {
          text += `- ${step.step}: ${step.status}\n`;
        });
        text += '\n';
      }
      
      if (debugInfo.full_llm_responses?.length) {
        text += `### Research Queries (${debugInfo.full_llm_responses.length} total):\n`;
        debugInfo.full_llm_responses.forEach((response, idx) => {
          text += `${idx + 1}. [${response.platform}] ${response.query}\n`;
          text += `   Response: ${response.response_length} chars, ${response.citations_count} citations\n\n`;
        });
      }
      
      if (debugInfo.page_analysis?.length) {
        text += `### Pages Analyzed (${debugInfo.page_analysis.length} total):\n`;
        debugInfo.page_analysis.forEach(page => {
          text += `- ${page.url} (${page.status}) - ${page.content_length} chars\n`;
        });
        text += '\n';
      }
    }
    
    text += `\nGenerated: ${new Date(brief.generated_at).toLocaleString()}\n`;
    
    return text;
  }
  
  return {
    isGenerating,
    currentBrief,
    error,
    generateBrief,
    getBrief,
    listBriefs,
    getBriefStatus,
    exportBrief
  };
}