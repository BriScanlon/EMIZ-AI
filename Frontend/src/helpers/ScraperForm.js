import axios from 'axios';

  const extractFields = (aggregatedText) => {
    const regexHeadline = /"headLine"\s*:\s*"([^"]+)"/;
    const regexDescription = /"description"\s*:\s*"([^"]+)"/;
    const regexArticleBody = /"articleBody"\s*:\s*"([^"]+)"/;

    const headlineMatch = aggregatedText.match(regexHeadline);
    const descriptionMatch = aggregatedText.match(regexDescription);
    const articleBodyMatch = aggregatedText.match(regexArticleBody);

    const headline = headlineMatch ? headlineMatch[1] : '';
    const description = descriptionMatch ? descriptionMatch[1] : '';
    const articleBody = articleBodyMatch ? articleBodyMatch[1] : '';
console.log(`headline:"${headline}", description:"${description}", articleBody:"${articleBody}"`)
    return `headline:"${headline}", description:"${description}", articleBody:"${articleBody}"`;
  };

  const fetchChatGPTResponse = async (text) => {
    const prompt = `**Objective:** Analyze the provided engineering text...${text}`;

    try {
      const { data } = await axios.post('http://localhost:5000/chatgpt', { prompt });
      const responseText = data?.data?.content[0]?.text;
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      const jsonString = responseText.substring(jsonStart, jsonEnd);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error fetching response:', error);
      return 'Failed to get response';
    }
  };

  export const handleScrape = async (urls) => {
  

    try {
      const scrapePromises = [urls].map(async (url) => {
        try {
          
          const { data } = await axios.get(`http://localhost:5000/scrape?url=${encodeURIComponent(url)}`);
          return extractFields(data.text);
        } catch (error) {
          console.error(`Error scraping the URL: ${url}`, error);
          return '';
        }
      }
    );

      const scrapedTexts = await Promise.all(scrapePromises);
      const aggregatedText = scrapedTexts.filter((text) => text).join('\n');
      const response = await fetchChatGPTResponse(aggregatedText);
      console.log(aggregatedText)
      return extractFields(aggregatedText)
    } catch (error) {
      console.error('Error during processing URLs:', error);
    } 
  };
