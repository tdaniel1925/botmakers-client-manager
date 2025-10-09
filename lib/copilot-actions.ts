/**
 * AI Co-Pilot Action Executors
 * These functions handle the execution of actions triggered by the AI
 */

// Export data to CSV
export async function exportToCSV(dataType: string) {
  try {
    // Generate CSV filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${dataType}-export-${timestamp}.csv`;

    // Fetch data from the appropriate endpoint
    const response = await fetch(`/api/copilot/export/${dataType}`);
    
    if (!response.ok) {
      throw new Error(`Failed to export ${dataType}`);
    }

    const data = await response.json();

    // Convert data to CSV
    const csv = convertToCSV(data.items, data.headers);

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, filename };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: String(error) };
  }
}

// Convert array of objects to CSV string
function convertToCSV(items: any[], headers: string[]): string {
  if (!items || items.length === 0) {
    return headers.join(',') + '\n';
  }

  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const item of items) {
    const values = headers.map(header => {
      const value = item[header];
      // Escape commas and quotes
      const escaped = String(value ?? '').replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// Fetch campaign analytics
export async function fetchCampaignAnalytics(campaignId?: string) {
  try {
    const url = campaignId 
      ? `/api/copilot/analytics/campaign/${campaignId}`
      : `/api/copilot/analytics/campaigns`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return { success: false, error: String(error) };
  }
}

// Search contacts
export async function searchContacts(query: string) {
  try {
    const response = await fetch(`/api/copilot/contacts/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error('Failed to search contacts');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Contact search error:', error);
    return { success: false, error: String(error) };
  }
}

// Get dashboard stats
export async function getDashboardStats() {
  try {
    const response = await fetch('/api/copilot/dashboard/stats');
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return { success: false, error: String(error) };
  }
}

