import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { InjectRepository } from '@nestjs/typeorm';
import { TbUser } from './entity/user.entity';
import { Repository } from 'typeorm';
import { TbInterest } from './entity/interest.entity';
import { TbPrompt } from './entity/prompt.entity';
import { TbPromptAnswer } from './entity/prompt_answer.entity';
import { TbUserImage } from './entity/user_image.entity';
import { writeFileSync, writeSync } from 'fs';

//import { Pool } from 'pg';
import axios from 'axios';
import imageSize from 'image-size';

@Injectable()
export class AppService {
  //private pool: Pool;
  constructor(
    @InjectRepository(TbUser)
    private userRepository: Repository<TbUser>,
    @InjectRepository(TbInterest)
    private interestRepository: Repository<TbInterest>,
    @InjectRepository(TbPromptAnswer)
    private promptAnswerRepository: Repository<TbPromptAnswer>,
    @InjectRepository(TbPrompt)
    private promptRepository: Repository<TbPrompt>,
    @InjectRepository(TbUserImage)
    private imageRepository: Repository<TbUserImage>
  ) { }
  async saveUserData(userName: string, userAge: string, verificationStatus: string, studyDetails: string, about: string) {
    const _user = await this.userRepository.save({
      name: userName,
      age: userAge,
      occupation: studyDetails,
      is_verified: verificationStatus,
      about: about
    })
    return _user.id;
  }

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

  async processDynamicContent(page: puppeteer.Page): Promise<boolean> {

    const prompts = await this.promptRepository.find();

    // Extracting profile details 
    const parentXPath = '/html/body/div/div/div[1]/main/div[2]/div/div/span/div[1]/article/div[1]';
    await page.waitForXPath(parentXPath, { timeout: 2 * 60 * 1000 })
      .then(() => {
        console.log("Parent Element found");
      })
      .catch(async (err) => {
        console.error("Error waiting for element:", err);

        while (true) {
          console.log("Refreshing the page...");
          try {
            // Trigger page reload
            await page.reload({ waitUntil: "domcontentloaded", timeout: 2 * 60 * 1000 }).catch(e => console.error("Error reloading page:", e));

            // Wait for the specific element you're interested in
            const parentPath = '/html/body/div/div/div[1]/main/div[2]/div/div/span/div[1]/article/div[1]';
            await page.waitForXPath(parentPath, { timeout: 2 * 60 * 1000 });
            console.log("Parent Element found after refresh");
            break;
          } catch (error) {
            console.error("Still having trouble finding the element, refreshing again:", error);
          }
        }
      });

    const profiles = await page.$x('/html/body/div/div/div[1]/main/div[2]/div/div/span/div[1]/article/div[1]');
    if (profiles.length > 0) {
      const profile = profiles[0]; // Get the first element from the XPath result

      // For CSS selection inside the profile element
      const childProfile = await profile.$('div:first-of-type');
      console.log("New Profile:");

      const userProfile = await childProfile.$('.encounters-story-profile__user');
      const textContent = await userProfile.evaluate(el => el.textContent.trim());

      // Splitting the text and trimming with whitespace
      const [userName, userAge] = textContent.split(',').map(part => part.trim());
      console.log(`User name: ${userName}, User age: ${userAge}`);

      // Check for verification status
      const verificationStatus = await childProfile.$('.encounters-story-profile__verification') ? 'Verified' : 'Not verified';
      // Extract study details
      const studyDetailsElement = await childProfile.$('.encounters-story-profile__details');
      const studyDetails = studyDetailsElement ? await studyDetailsElement.evaluate(el => el.textContent.trim()) : 'Study details not found';
      console.log(`Verification Status: ${verificationStatus}, Study Details: ${studyDetails}`);

      const paragraphXPath = `${parentXPath}//p`;
      const unorderedListXPath = `${parentXPath}//ul`;

      const paragraphs = await page.$x(paragraphXPath);
      const unorderedLists = await page.$x(unorderedListXPath);
      console.log('Extracted content:');
      let aboutText = "";
      for (const p of paragraphs) {
        const text = await p.evaluate(element => element.textContent.trim());
        console.log(`Paragraph: ${text}`);
        aboutText = aboutText + text + " ";
      }
      const userId = await this.saveUserData(userName, userAge, verificationStatus, studyDetails, aboutText.trim());

      for (const ul of unorderedLists) {
        const listItems = await ul.$x('.//li');  // Using relative XPath to find list items within each ul
        let _interest = [];

        for (const listItem of listItems) {
          const text = await listItem.evaluate(element => element.textContent);
          const icons = await listItem.$x('.//img');  // Using relative XPath for images within list item

          if (icons.length) {
            for (const icon of icons) {
              const iconUrl = await icon.evaluate(img => (img as HTMLImageElement).src);
              const interestName = this.extractInterest(iconUrl);

              if (interestName) {
                console.log(`Interest: ${interestName}, Value: ${text}`);
                _interest.push({ [interestName]: text });

                await this.interestRepository.save({
                  interest_type: interestName,
                  interest_value: text,
                  user: userId
                });
              }
            }
          }
        }
        console.log(_interest);
      }


      const dynamicDivsXPath = `${parentXPath}/div[position() >= 3]`;
      const dynamicDivs = await page.$x(dynamicDivsXPath);
      //this is array of string Where all images will be saved
      const allImageUrls: string[] = [];
      const allPrompts = [];

      for (let i = 0; i < dynamicDivs.length; i++) {
        const div = dynamicDivs[i];
        const images = await div.$$('img');
        const headers = await div.$$('h1, h2, h3');
        const paragraphs = await div.$$('p');



        for (const image of images) {
          const imageUrl = await image.evaluate(img => (img as HTMLImageElement).src);
          allImageUrls.push(imageUrl);
          console.log('Photo URL:', imageUrl);
        }

        if (headers.length === 1 && paragraphs.length === 1) {
          console.log('Found 1 photo and text:');
          //const imageUrl = await images[0].evaluate(img => (img as HTMLImageElement).src);
          const headerText = await headers[0].evaluate(h => h.textContent);
          const paragraphText = await paragraphs[0].evaluate(p => p.textContent);
          console.log(headerText, paragraphText);
          console.log(headerText.trim().toLowerCase());
          const promptId = prompts.find(e => e.prompt.replace(/\s+/g, ' ').trim().toLowerCase() == headerText.replace(/\s+/g, ' ').trim().toLowerCase())?.id;// learm find and map
          if (promptId == null) {
            writeFileSync("unavalaible_Path.txt", `${headerText}\n`, { flag: "a" })
          } else {
            allPrompts.push({ user: userId, prompt: promptId, answer: paragraphText })
          }


        }
        else if (headers.length === 2 && paragraphs.length === 2) {
          console.log("found 2 text:");
          const headerText1 = await headers[0].evaluate(h => h.textContent);
          const paragraphText1 = await paragraphs[0].evaluate(p => p.textContent);

          const headerText2 = await headers[1].evaluate(h => h.textContent);
          const paragraphText2 = await paragraphs[1].evaluate(p => p.textContent);
          console.log(`Header1: ${headerText1}, Paragraph1: ${paragraphText1}`);
          console.log(`Header2: ${headerText2}, Paragraph2: ${paragraphText2}`);

          const promptId_1 = prompts.find(e => e.prompt.replace(/\s+/g, ' ').trim().toLowerCase() == headerText1.replace(/\s+/g, ' ').trim().toLowerCase())?.id;
          if (promptId_1 == null) {
            writeFileSync("unavalaible_Path.txt", `${headerText1}\n`, { flag: "a" })
          } else {
            allPrompts.push({ user: userId, prompt: promptId_1, answer: paragraphText1 })
          }
          const promptId_2 = prompts.find(e => e.prompt.replace(/\s+/g, ' ').trim().toLowerCase() == headerText2.replace(/\s+/g, ' ').trim().toLowerCase())?.id;
          if (promptId_2 == null) {
            writeFileSync("unavalaible_Path.txt", `${headerText2}\n`, { flag: "a" })

          } else {
            allPrompts.push({ user: userId, prompt: promptId_2, answer: paragraphText2 })
          }


        } else {

          console.log('Unexpected content format.');
        }
      }
      //profile photo
      const profileImageUrl = await childProfile.$eval('.encounters-story-profile-image img', img => (img as HTMLImageElement).src);
      await this.imageRepository.save([profileImageUrl, ...allImageUrls].map(img => ({ user: userId, url: img })))
      console.log('All extracted image URLs:', allImageUrls);

      await this.promptAnswerRepository.save(allPrompts);

    }
    return true;
  }

  async openBumble(): Promise<string> {
    // const prompts = await this.promptRepository.find();
    // console.log(prompts);
    const browser = await puppeteer.launch({ headless: false });
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

      const shouldContinue = await this.processDynamicContent(page);
      if (!shouldContinue) {
        console.log('Stopping the scraping process due to missing prompt ID.');
        break;  // Exit the loop if scraping should be stopped
      }
      // await this.processDynamicContent(page);
      await page.keyboard.press('ArrowRight'); // Simulates a right swipe
      await page.waitForTimeout(6000); // Waits for 10 seconds
    }


    await browser.close(); // Close the browser after operation is complete
    return 'Bumble opened in browser and interaction completed.';
  }

  async extractUsers() {
    try {
      return await this.promptAnswerRepository.createQueryBuilder("prompt_answer")
        .leftJoinAndSelect("prompt_answer.user", "user")
        .leftJoinAndSelect("prompt_answer.prompt", "prompt")
        .select([
          "prompt_answer.id",
          "prompt_answer.answer",
          "prompt.id",
          "user.id"
        ]).getMany()
    } catch (error) {
      throw error;
    }
  }

  async logSmallImageUrls(): Promise<void> {
    const images = await this.imageRepository.find({
      select: ['url'],
      take: 50
    });

    const urls = images.map(image => image.url);
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36';

    for (const url of urls) {
      try {
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          headers: {
            'User-Agent': userAgent,
            'Referer': 'https://www.example.com/' // Adjust based on actual referrer if necessary
          }
        });
        const size = imageSize(response.data);
        if (size.width <= 140 || size.height <= 140) {
          console.log('Small image URL:', url);
        }

      } catch (error) {
        console.error('Error processing image:', url, error.message);
        if (error.response && error.response.status === 403) {
          console.error('Access forbidden. You might be rate limited or need authentication.');
        }
      }
    }
  }

  async fixImages(): Promise<void> {
    await this.logSmallImageUrls();
  }
}
