const FALLBACK_NEWS = [
  {
    title: 'Indian Students Increasingly Target Germany & Europe for STEM Degrees in 2026',
    link: 'https://timesofindia.indiatimes.com/education',
    snippet: 'With zero or low tuition fees and robust post-study work rights, German and Scandinavian universities witness a 38% rise in applications from Indian engineering graduates.',
    date: 'Today',
    source: 'Times of India Education',
  },
  {
    title: 'RBI & Major NBFCs Expand Collateral-Free Education Loans up to ₹75 Lakhs',
    link: 'https://economictimes.indiatimes.com/wealth/borrow',
    snippet: 'Leading lenders Avanse, Auxilo, and HDFC Credila streamline digital sanction letters and flexible repayment moratoriums for admitted graduate candidates.',
    date: '1 day ago',
    source: 'Economic Times',
  },
  {
    title: 'US and European Consulates Open Priority Student Visa Interview Appointment Slots',
    link: 'https://indianexpress.com/section/education/',
    snippet: 'Consular offices increase appointment availability for F-1 and national student visas across Mumbai, Delhi, Hyderabad, and Chennai consulates ahead of upcoming intakes.',
    date: '2 days ago',
    source: 'Indian Express',
  },
  {
    title: 'Top Global Universities Announce Merit Scholarships for Indian Tech & Management Applicants',
    link: 'https://www.ndtvprofit.com/education',
    snippet: 'Institutions across the US, UK, and Australia roll out departmental fellowships and diversity grants covering 20% to 50% of tuition for high-performing students.',
    date: '3 days ago',
    source: 'NDTV Education',
  },
  {
    title: 'GRE & IELTS Updates 2026: More Universities Embrace Holistic Profile Reviews',
    link: 'https://www.thehindu.com/education/',
    snippet: 'Admissions committees place higher weight on relevant project portfolios, SOP clarity, and technical experience alongside standardized test scores.',
    date: '4 days ago',
    source: 'The Hindu',
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || 'education abroad India students study abroad loans scholarship 2026'

    const apiKey = process.env.SERPER_API_KEY
    if (apiKey && apiKey !== 'dummy-build-key') {
      try {
        const response = await fetch('https://google.serper.dev/news', {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: query,
            gl: 'in',
            hl: 'en',
            num: 15,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data && Array.isArray(data.news) && data.news.length > 0) {
            return Response.json(data)
          }
        } else {
          console.warn(`[news] Serper API HTTP ${response.status}`)
        }
      } catch (serperErr) {
        console.warn('[news] Serper fetch failed, using fallback articles:', serperErr)
      }
    }

    // Fallback news if Serper key is not set or request failed
    return Response.json({
      searchParameters: { q: query, gl: 'in', hl: 'en' },
      news: FALLBACK_NEWS,
    })
  } catch (error) {
    console.error('News API error:', error)
    return Response.json({
      news: FALLBACK_NEWS,
    })
  }
}
