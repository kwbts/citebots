// src/lib/resultsFormatter.js

/**
 * Create a client summary from the query results
 * @param {Array} queryDataArray - Array of query result objects
 * @param {Array} competitors - Array of competitor objects
 * @returns {Object} - Client summary data
 */
function createClientSummary(queryDataArray, competitors) {
    const clientSummary = {
      total_queries: queryDataArray.length,
      total_pages: 0,
      average_citation_count: 0,
      brand_mention_rate: 0,
      average_page_speed: 0,
      average_domain_authority: 0,
      competitor_visibility: {}
    };
    
    // Calculate totals
    let totalPages = 0;
    let totalCitations = 0;
    let brandMentions = 0;
    const allPages = [];
    
    queryDataArray.forEach(result => {
      totalPages += (result.associated_pages?.length || 0);
      totalCitations += (result.citation_count || 0);
      brandMentions += (result.brand_mentioned ? 1 : 0);
      
      if (result.associated_pages && result.associated_pages.length > 0) {
        allPages.push(...result.associated_pages);
      }
    });
    
    clientSummary.total_pages = totalPages;
    clientSummary.average_citation_count = queryDataArray.length > 0 ? 
      totalCitations / queryDataArray.length : 0;
    clientSummary.brand_mention_rate = queryDataArray.length > 0 ? 
      brandMentions / queryDataArray.length : 0;
    
    // Calculate averages
    if (totalPages > 0) {
      let totalPageSpeed = 0;
      let totalDomainAuthority = 0;
      let validPageSpeedCount = 0;
      let validDomainAuthorityCount = 0;
      
      allPages.forEach(page => {
        if (page.page_performance && 
            typeof page.page_performance.page_speed_score === 'number') {
          totalPageSpeed += page.page_performance.page_speed_score;
          validPageSpeedCount++;
        }
        
        if (page.domain_authority && 
            typeof page.domain_authority.domain_authority === 'number') {
          totalDomainAuthority += page.domain_authority.domain_authority;
          validDomainAuthorityCount++;
        }
      });
      
      clientSummary.average_page_speed = validPageSpeedCount > 0 ? 
        Number((totalPageSpeed / validPageSpeedCount).toFixed(2)) : 0;
        
      clientSummary.average_domain_authority = validDomainAuthorityCount > 0 ? 
        Number((totalDomainAuthority / validDomainAuthorityCount).toFixed(2)) : 0;
    }
    
    // Calculate competitor visibility
    if (competitors && Array.isArray(competitors)) {
      for (const comp of competitors) {
        try {
          // Find mentions in each result
          const allMentions = [];
          
          queryDataArray.forEach(result => {
            const mentions = result.associated_pages?.filter(page => 
              page.is_competitor_domain || 
              (result.competitor_mentioned_name && 
               result.competitor_mentioned_name.includes(comp.name))
            ) || [];
            
            allMentions.push(...mentions);
          });
          
          if (allMentions.length > 0) {
            const totalPositions = allMentions.reduce((sum, page) => 
              sum + (page.citation_position || 0), 0);
              
            const avgPosition = Number(
              (totalPositions / allMentions.length).toFixed(1)
            );
            
            clientSummary.competitor_visibility[comp.name] = {
              mention_count: allMentions.length,
              average_position: avgPosition
            };
          }
        } catch (compError) {
          console.error(`Error calculating visibility for ${comp.name}:`, compError);
        }
      }
    }
    
    return clientSummary;
  }
  
  module.exports = {
    createClientSummary
  };