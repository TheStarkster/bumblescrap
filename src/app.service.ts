import { Injectable } from '@nestjs/common';
import { sign } from 'crypto';
import * as puppeteer from 'puppeteer';

@Injectable()
export class AppService {

  extractInterest(url: string) {
    switch (url) {
      case "https://gew3.ecdn2.bumbcdn.com/i/big/assets/bumble_lifestyle_badges/normal/web/standard/sz___size__/ic_badge_profileChips_dating_heightv2.png": return "height"
      case "https://gew3.ecdn2.bumbcdn.com/i/big/assets/bumble_lifestyle_badges/normal/web/standard/sz___size__/ic_badge_profileChips_dating_exercisev2.png": return "excersie"
      case "https://gew3.ecdn2.bumbcdn.com/i/big/assets/bumble_lifestyle_badges/normal/web/standard/sz___size__/ic_badge_profileChips_dating_educationv2.png": return "eductaion_level"
      case "https://gew3.ecdn2.bumbcdn.com/i/big/assets/bumble_lifestyle_badges/normal/web/standard/sz___size__/ic_badge_profileChips_dating_drinkingv2.png": return "drinking"
      case "https://gew3.ecdn2.bumbcdn.com/i/big/assets/bumble_lifestyle_badges/normal/web/standard/sz___size__/ic_badge_profileChips_dating_smokingv2.png": return "somking"
      case "https://gew3.ecdn2.bumbcdn.com/i/big/assets/bumble_lifestyle_badges/normal/web/standard/sz___size__/ic_badge_profileChips_dating_intentionsv2.png": return "looking_for"
      case "https://gew3.ecdn2.bumbcdn.com/i/big/assets/bumble_lifestyle_badges/normal/web/standard/sz___size__/ic_badge_profileChips_dating_familyPlansv2.png": return "kids"
      case "https://gew3.ecdn2.bumbcdn.com/i/big/assets/bumble_lifestyle_badges/normal/web/standard/sz___size__/ic_badge_profileChips_dating_starSignv2.png": return "star_sign"
      case "https://gew3.ecdn2.bumbcdn.com/i/big/assets/bumble_lifestyle_badges/normal/web/standard/sz___size__/ic_badge_profileChips_dating_Politics2.png": return "politics"
      case "https://gew3.ecdn2.bumbcdn.com/i/big/assets/bumble_lifestyle_badges/normal/web/standard/sz___size__/ic_badge_profileChips_dating_religionv2.png": return "religion"
      case "https://gew3.ecdn2.bumbcdn.com/i/big/assets/bumble_lifestyle_badges/normal/web/standard/sz___size__/ic_badge_profileChips_dating_intentionsv2.png": return "dating_intention"
      case "https://gew3.ecdn2.bumbcdn.com/i/big/assets/bumble_lifestyle_badges/normal/web/standard/sz___size__/ic_badge_profileChips_dating_genderv2.png": return "gender"
        break;

      default:
        break;
    }
  }

  async processDynamicContent(page: puppeteer.Page) {
    // Extracting profile details
    const parentXPath = '/html/body/div/div/div[1]/main/div[2]/div/div/span/div[1]/article/div[1]';
    await page.waitForXPath(parentXPath, { timeout: 2 * 60 * 1000 })
      .then(() => console.log("Parent Element found"))
      .catch(err => console.error("Error waiting for element:", err));

      const profiles = await page.$x('/html/body/div/div/div[1]/main/div[2]/div/div/span/div[1]/article/div[1]');
    if (profiles.length > 0) {
      const profile = profiles[0]; // Get the first element from the XPath result

      // For CSS selection inside the profile element
      const childProfile = await profile.$('div:first-of-type'); // Assuming you want the first div inside the profile
      const allChildElements = await profile.$$('.child-class');

      if (allChildElements) {

        const profileImageUrl = await childProfile.$eval('.encounters-story-profile-image img', img => (img as HTMLImageElement).src);
        const userProfile = await childProfile.$('.encounters-story-profile__user');
        const userNameAndAge = userProfile ? await userProfile.evaluate(el => el.textContent.trim()) : 'User name and age not found';

        // Check for verification status
        const verificationStatus = await childProfile.$('.encounters-story-profile__verification') ? 'Verified' : 'Not verified';

        // Extract study details
        const studyDetailsElement = await childProfile.$('.encounters-story-profile__details');
        const studyDetails = studyDetailsElement ? await studyDetailsElement.evaluate(el => el.textContent.trim()) : 'Study details not found';
        console.log(`Image URL: ${profileImageUrl}, Name and Age: ${userNameAndAge}, Verification Status: ${verificationStatus}, Study Details: ${studyDetails}`);

        // Extract paragraphs and unordered lists from the specific section
        const sectionSelector = '.encounters-story-section.encounters-story-section--about';
        const contentDivSelector = '.encounters-story-section__content';

        const section = await page.$(sectionSelector);
        if (section) {
          const contentDiv = await section.$(contentDivSelector);
          if (contentDiv) {
            const paragraphs = await contentDiv.$$('p');
            const unorderedLists = await contentDiv.$$('ul');

            if (paragraphs.length || unorderedLists.length) {
              console.log('Extracted content:');
              for (const p of paragraphs) {
                const text = await p.evaluate(element => element.textContent);
                console.log(`Paragraph: ${text}`);
              }
              for (const ul of unorderedLists) {
                const listItems = await ul.$$('li');

                let _interest = [];

                for (const listItem of listItems) {
                  const text = await listItem.evaluate(element => element.textContent);
                  //console.log(`List Item: ${text}`);


                  // Find images within the list item, assuming each list item has its own set of images
                  const images = await listItem.$$('img');
                  if (images.length) {
                    for (const image of images) {
                      const imageUrl = await image.evaluate(img => (img as HTMLImageElement).src);
                      const interestName = this.extractInterest(imageUrl);
                      _interest.push({ [interestName]: text })

                      // console.log(`Image URL for item: ${imageUrl}`);
                    }
                  } else {
                    console.log('No images found for this list item.');
                  }

                }
                console.log(_interest);
              }
            } else {
              console.log('No <p> or <ul> tags found in the specified div.');
            }
          } else {
            console.log('Content div not found in the specified section.');
          }
        } else {
          console.log('Specified section not found.');
        } 
      } else {
        console.log('Profile section not found, moving forward.');
      }
      // Handling dynamic divs after the first two fixed divs
      const allDivs = await profile.$$('div');
      const fixedDivs = allDivs.slice(0, 2); // First two divs are considered as fixed
      // Process fixed divs if needed...
      for (const fixedDiv of fixedDivs) {
          // Your logic for processing each fixed div
          console.log('Processing fixed div');
      }

      const dynamicDivs = allDivs.slice(2); // Remaining divs are considered as dynamic
      for (const div of dynamicDivs) {
          const images = await div.$$('img');
          const headers = await div.$$('h1, h2, h3');
          const paragraphs = await div.$$('p');

          if (images.length === 2) {
              console.log('Found 2 photos:');
              for (const image of images) {
                  const imageUrl = await image.evaluate(img => (img as HTMLImageElement).src);
                  console.log('Photo URL:', imageUrl);
              }
          } else if (images.length === 1 && headers.length === 1 && paragraphs.length === 1) {
              console.log('Found 1 photo and text:');
              const imageUrl = await images[0].evaluate(img => (img as HTMLImageElement).src);
              const headerText = await headers[0].evaluate(h => h.textContent);
              const paragraphText = await paragraphs[0].evaluate(p => p.textContent);
              console.log(`Photo URL: ${imageUrl}, Header: ${headerText}, Paragraph: ${paragraphText}`);
          } else if (headers.length === 1 && paragraphs.length === 1) {
              console.log('Found only text:');
              const headerText = await headers[0].evaluate(h => h.textContent);
              const paragraphText = await paragraphs[0].evaluate(p => p.textContent);
              console.log(`Header: ${headerText}, Paragraph: ${paragraphText}`);
          } else if (images.length === 1) {
              console.log('Found 1 photo or location:');
              const imageUrlOrLocation = await images[0].evaluate(img => (img as HTMLImageElement).src);
              console.log(`Photo URL or Location: ${imageUrlOrLocation}`);
          } else {
              console.log('Unexpected content format.');
          }
      }
      
      
    }
  }

  async openBumble(): Promise<string> {
    const browser = await puppeteer.launch({ headless: false }); // `headless: false` shows the browser UI
    const page = await browser.newPage();
    await page.goto('https://bumble.com/get-started', { waitUntil: 'domcontentloaded' });

    // Click on the button by XPath
    const buttonXPath = '/html/body/div/div/div[1]/div[2]/main/div/div[3]/form/div[3]/button';
    await page.waitForXPath(buttonXPath, { timeout: 2 * 60 * 1000 }); // Ensure the element is loaded
    const [button] = await page.$x(buttonXPath); // Finds the button
    if (button) {
      await button.click();
    }

    // Fill in the text box
    const textBoxXPath = '/html/body/div/div/div[1]/div[2]/main/div/div[3]/form/div[3]/div[2]/div/div[1]/div/input';
    await page.waitForXPath(textBoxXPath, { timeout: 2 * 60 * 1000 }); // Ensure the text box is loaded
    const [textBox] = await page.$x(textBoxXPath); // Finds the text box
    if (textBox) {
      await textBox.type('7357546622');
    }

    // Hit Enter and wait for 60 sec
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });


    //create a infinte loop to right swipe by hiting right arrow in the keyboard and for 10sec before each right swipe
    while (true) {
      await this.processDynamicContent(page);
      await page.keyboard.press('ArrowRight'); // Simulates a right swipe
      await page.waitForTimeout(10000); // Waits for 10 seconds
    }


    await browser.close(); // Close the browser after operation is complete
    return 'Bumble opened in browser and interaction completed.';
  }
}
