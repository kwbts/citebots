// Competitor mention data
const competitorsWithMentionData = computed(() => {
  const competitors = props.reportData?.competitors || []
  const queries = filteredQueries.value
  
  if (queries.length === 0) {
    return []
  }
  
  // Extract all competitor mentions from queries
  const competitorMentions = new Map()
  
  queries.forEach(query => {
    if (query.competitor_mentioned_names && Array.isArray(query.competitor_mentioned_names)) {
      query.competitor_mentioned_names.forEach(name => {
        if (name && name.trim()) {
          const lowerName = name.toLowerCase()
          const data = competitorMentions.get(lowerName) || { 
            name, 
            mentions: 0,
            platformData: new Map()
          }
          
          data.mentions++
          
          // Track platform data
          if (query.data_source) {
            const platform = query.data_source.toLowerCase()
            const platformStats = data.platformData.get(platform) || { count: 0, total: 0 }
            platformStats.count++
            data.platformData.set(platform, platformStats)
          }
          
          competitorMentions.set(lowerName, data)
        }
      })
    }
  })
  
  // Count platform queries
  const platformCounts = new Map()
  queries.forEach(query => {
    if (query.data_source) {
      const platform = query.data_source.toLowerCase()
      platformCounts.set(platform, (platformCounts.get(platform) || 0) + 1)
    }
  })
  
  // Process platform data
  competitorMentions.forEach(data => {
    const processedPlatformData = []
    data.platformData.forEach((stats, platform) => {
      const totalForPlatform = platformCounts.get(platform) || 0
      if (totalForPlatform > 0) {
        processedPlatformData.push({
          platform,
          rate: (stats.count / totalForPlatform) * 100
        })
      }
    })
    data.platformData = processedPlatformData
  })
  
  // If we have actual competitor data, use it
  if (competitors.length > 0) {
    return competitors.map(comp => {
      const mentionData = competitorMentions.get(comp.name.toLowerCase())
      
      return {
        id: comp.id,
        name: comp.name,
        domain: comp.domain,
        mentions: mentionData?.mentions || 0,
        mentionRate: mentionData ? (mentionData.mentions / queries.length) * 100 : 0,
        platformData: mentionData?.platformData || []
      }
    })
  }
  
  // Otherwise use the extracted mentions
  return Array.from(competitorMentions.values())
    .map(data => ({
      id: `comp-${Math.random().toString(36).substring(2, 9)}`,
      name: data.name,
      domain: `${data.name.toLowerCase().replace(/\s+/g, '')}.com`,
      mentions: data.mentions,
      mentionRate: (data.mentions / queries.length) * 100,
      platformData: data.platformData
    }))
    .sort((a, b) => b.mentionRate - a.mentionRate)
})

// Competitor citation data
const competitorsWithCitationData = computed(() => {
  const competitors = props.reportData?.competitors || []
  const pageAnalyses = props.reportData?.page_analyses || []
  
  if (pageAnalyses.length === 0) {
    return []
  }
  
  // Extract citation data for competitors
  const competitorCitations = new Map()
  
  pageAnalyses.forEach(page => {
    if (page.is_competitor_domain && page.competitor_names && Array.isArray(page.competitor_names)) {
      page.competitor_names.forEach(name => {
        if (name && name.trim()) {
          const lowerName = name.toLowerCase()
          const data = competitorCitations.get(lowerName) || {
            name,
            citations: 0,
            domain: page.domain_name || '',
            pages: new Set()
          }
          
          data.citations++
          if (page.domain_name) {
            data.domain = page.domain_name
          }
          if (page.citation_url) {
            data.pages.add(page.citation_url)
          }
          
          competitorCitations.set(lowerName, data)
        }
      })
    }
  })
  
  // Process data
  competitorCitations.forEach(data => {
    data.pageCount = data.pages.size
    delete data.pages // Clean up the Set
  })
  
  // If we have competitors data, use it
  if (competitors.length > 0) {
    return competitors.map(comp => {
      const citationData = competitorCitations.get(comp.name.toLowerCase())
      
      return {
        id: comp.id,
        name: comp.name,
        domain: comp.domain,
        citations: citationData?.citations || 0,
        citationRate: citationData ? (citationData.citations / totalCitations.value) * 100 : 0,
        qualityScore: 3 + Math.random() * 2 // Random score between 3-5 for demo
      }
    })
  }
  
  // Otherwise use the extracted citations
  return Array.from(competitorCitations.values())
    .map(data => ({
      id: `comp-${Math.random().toString(36).substring(2, 9)}`,
      name: data.name,
      domain: data.domain || `${data.name.toLowerCase().replace(/\s+/g, '')}.com`,
      citations: data.citations,
      citationRate: (data.citations / totalCitations.value) * 100,
      qualityScore: 3 + Math.random() * 2 // Random score between 3-5 for demo
    }))
    .sort((a, b) => b.citationRate - a.citationRate)
})