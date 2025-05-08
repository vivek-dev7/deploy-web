import sys
import requests
from bs4 import BeautifulSoup
import json

def scrape_stock_news():
    try:
        url = "https://economictimes.indiatimes.com/markets/stocks/news"
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            return json.dumps({"error": f"Failed to fetch news, status code: {response.status_code}"})

        soup = BeautifulSoup(response.text, "html.parser")
        articles = soup.find_all("div", class_="eachStory")

        if not articles:
            return json.dumps({"error": "No news articles found. The website structure may have changed."})

        news_list = []
        for article in articles[:10]:  # Fetch only the latest 10 news articles
            title_tag = article.find("h3")
            link_tag = article.find("a")
            summary_tag = article.find("p")

            if not title_tag or not link_tag:
                continue

            title = title_tag.text.strip()
            link = "https://economictimes.indiatimes.com" + link_tag["href"]
            summary = summary_tag.text.strip() if summary_tag else ""

            news_list.append({"title": title, "link": link, "summary": summary})

        return json.dumps(news_list)

    except Exception as e:
        return json.dumps({"error": f"An error occurred: {str(e)}"})

if __name__ == "__main__":
    print(scrape_stock_news())  # Print JSON response for Node.js
