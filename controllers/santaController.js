const fs = require('fs');
const moment = require('moment');
const { default: axios } = require('axios');

exports.sendMessageToSanta = async (req, res) => {
  const { username, gifts } = req.body;
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
              'Kids below 10 years old are applicable to send message to Santa!!!',
          });
        }
      }
      let children = {
        username: username,
        gifts: gifts,
        address: userProfiles.address,
      };

      let data = JSON.stringify(children);
      if (fs.existsSync('santaMail.json')) {
        fs.appendFileSync('santaMail.json', data);
      } else {
        fs.writeFileSync('santamail.json', data);
      }
      return res.render('result', {
        message: 'Hurray your message has been sent to Santa!!!',
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
