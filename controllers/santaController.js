const fs = require('fs');
const moment = require('moment');
const { default: axios } = require('axios');

exports.sendMessageToSanta = async (req, res) => {
  const { username, gifts } = req.body;
  let array = [];
  try {
    const usersDB = await axios.get(process.env.USERSDB);
    const user = usersDB.data.find((user) => user.username === username);
    if (user) {
      const userProfilesDB = await axios.get(process.env.USERSPROFILE);
      const userProfiles = userProfilesDB.data.find(
        (userProfile) => user.uid === userProfile.userUid
      );
      if (userProfiles) {
        let age = moment().diff(
          moment(userProfiles.birthdate, 'YYYY/MM/DD').toISOString(),
          'years'
        );
        if (age > 10) {
          return res.render('result', {
            message:
              'You are not eligible to register for this event since your age is above 10!',
          });
        }
      }
      let children = {
        username: username,
        gifts: gifts,
        address: userProfiles.address,
      };
      // console.log(children);
      array.push(JSON.stringify(children));
      if (fs.existsSync('santaMail.json')) {
        fs.readFile('santaMail.json', 'utf8', async (err, data) => {
          let santaList = JSON.parse(data);
          if (santaList.length > 0) {
            santaList.map((child) => {
              array.push(child);
              fs.writeFileSync(
                'santaMail.json',
                JSON.stringify(array),
                function (err) {
                  if (err) {
                    console.log(err);
                  }
                }
              );
            });
          } else {
            fs.writeFileSync(
              'santaMail.json',
              JSON.stringify(array),
              function (err) {
                if (err) {
                  console.log(err);
                }
              }
            );
          }
         
        });
      } else {
        fs.writeFileSync(
          'santaMail.json',
          JSON.stringify(array),
          function (err) {
            if (err) {
              console.log(err);
            }
          }
        );
      }

      return res.render("result", {
        message: "Hurray your message has been sent to Santa!!!",
      });
    } else {
      return res.render('result', {
        message: 'User not found',
      });
    }
  } catch (error) {
    return res.status(400).json({ error: error });
  }
};