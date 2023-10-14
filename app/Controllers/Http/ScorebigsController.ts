// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
//https://www.scorebig.com/mlb-tickets?promo=SB5OFF

const puppeteer = require('puppeteer-extra');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

//Models//
import Scorebig from "App/Models/Scorebig";

/////
class ScorebigsController {

    async teams({ response }) {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            // Navigate to the website URL
            await page.goto('https://www.scorebig.com/mlb-tickets?promo=SB5OFF'); // Replace with the actual URL

            // Wait for the page to load completely (you might need to adjust the wait time)
            await page.waitForSelector('.tile-event');
            // Use Puppeteer to scrape data
            const scrapedData = await page.evaluate(() => {
                const events = document.querySelectorAll('.tile-event');
                const data = [];

                events.forEach((event) => {
                    const link = event.querySelector('a').getAttribute('href');
                    const city = event.querySelector('.tile-event-supertitle.tile-event-title').textContent;
                    const team = event.querySelector('div > div.tile-event-content > div:nth-child(2)').textContent;
                    //#main > div:nth-child(11) > div > div:nth-child(1) > a > div > div.tile-event-content > div:nth-child(2)

                    data.push({ link, city, team, })
                });

                return data;

            })
            const savedTeams = [];

            for (const data of scrapedData) {

                const existingTeam = await Scorebig.findBy('team', data.team)
                const scorebig = await Scorebig;
                if (!existingTeam) {
                    await scorebig.create({
                        link: data.link,
                        city: data.city,
                        team: data.team,
                    });

                    savedTeams.push(scorebig);

                }
            }


            // Close the browser
            await browser.close();

            return response.status(200).json(savedTeams);

        } catch (error) {
            console.log(error);
            return response.status(500).json({ error: error.message });
        }

    }


    /////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////


    async tickets_links({ response }) {
        try {

            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            // Navigate to the website URL
            await page.goto('https://www.scorebig.com/los-angeles-angels-of-anaheim-tickets?promo=SB5OFF&allLoadMore=17'); // Replace with the actual URL


            const ticketLink = [] as any
            //#performerEvents > button
            /*  const clickLoadMoreButton = async () => {
                  //#content > div > div > div.app-main-content__wrapper > main > div.Gw9Hk164B35zyc78n1aAv > div:nth-child(2) > section > div > button
                  const loadMoreButton = await page.$('.load-more-events grey-button');
                  if (loadMoreButton) {
                      await loadMoreButton.click();
                      // Wait for some time for the new data to load (you can adjust the timeout as needed)
                      await page.waitForTimeout(4000);
                      return true;
                  }
                  return false;
              };
  */
            const data = [] as any

            // Wait for the page to load completely (you might need to adjust the wait time)
            await page.waitForSelector('.event-list');


            // Use Puppeteer to scrape data

            //while (true) {
            const scrapedData = await page.evaluate(() => {
                const events = document.querySelectorAll('.event-item');
                const data = [];

                events.forEach((event) => {
                    let link = event.querySelector('.event-link-slug').getAttribute('value');
                    //https://www.scorebig.com/

                    data.push({ link })
                });

                return data;

            });

            data.push(...scrapedData)

            /*   if (!(await clickLoadMoreButton())) {
                   break;
               }
           }*/

            ticketLink.push({ data })


            /*const savedTeams = [];

            for (const data of scrapedData) {

                const existingTeam = await Scorebig.findBy('team', data.team)
                const scorebig = await Scorebig;
                if (!existingTeam) {
                    await scorebig.create({
                        link: data.link,
                        city: data.city,
                        team: data.team,
                    });

                    savedTeams.push(scorebig);

                }
            } */

            await browser.close();

            return response.status(200).json(ticketLink);


        } catch (error) {
            console.log(error);
            return response.status(500).json({ error: error.message });
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

    async tickets_links2({ response }) {
        try {
            const browser = await puppeteer.launch({
                headless: false,
            });
            const page = await browser.newPage();

            await page.goto('https://www.scorebig.com/los-angeles-angels-of-anaheim-tickets');

            const clickLoadMoreButton = async () => {
                const loadMoreButton = await page.$('#performerEvents > button');
                if (loadMoreButton) {
                    await loadMoreButton.click();
                    // Wait for some time for the new data to load (you can adjust the timeout as needed)
                    await page.waitForTimeout(4000);
                    return true;
                }
                return false;
            };

            const links = [];
            let clickedLoadMore = false; // Flag to indicate if the "Load More" button has been clicked

            do {
                const eventLinks = await page.$$eval('.event-link-slug', (elements) =>
                    elements.map((element) => element.getAttribute('value'))
                );

                links.push(...eventLinks);

                clickedLoadMore = await clickLoadMoreButton();
            } while (clickedLoadMore);

            await browser.close();

            // Return the links as a JSON response
            return response.status(200).json(links);
        } catch (error) {
            console.log(error);
            return response.status(500).json({ error: error.message });
        }
    }

}



module.exports = ScorebigsController;
