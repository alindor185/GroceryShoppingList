// const mongoose = require('mongoose');
// const crypto = require('crypto'); // Use to generate a unique joinCode

// module.exports = {

//   createFamily: async (req, res) => {
//     console.log('User ID:', userId);
//     const { Family, User } = mongoose.models;

//     const { name } = req.body;
//     const userId = req.user.id; // Extract user ID from authenticated user (JWT)

//     try {
//       // Generate a unique join code
//       let joinCode;
//       let isUnique = false;
//       while (!isUnique) {
//         joinCode = crypto.randomBytes(2).toString('hex').toUpperCase();
//         const existingFamily = await Family.findOne({ joinCode });
//         if (!existingFamily) isUnique = true; // Ensure joinCode is unique
//       }

//       // // Check if the user already has a family
//       // const existingUser = await User.findById(userId).populate('family');
//       // if (existingUser.family) {
//       //   return res.status(400).json({ message: 'User already belongs to a family' });
//       // }

//       // Create new family
//       const family = new Family({
//         name,
//         createdBy: userId,
//         members: [userId], // Add the creator as the first member
//         joinCode, // Assign generated join code
//       });

//       const savedFamily = await family.save();

//       // Update user with family reference
//       await User.findByIdAndUpdate(userId, { family: savedFamily._id });

//       res.status(201).json({
//         message: 'Family created successfully',
//         family: {
//           id: savedFamily._id,
//           name: savedFamily.name,
//           joinCode: savedFamily.joinCode, // Include join code in the response
//         },
//       });
//     } catch (error) {
//       console.error('Error in createFamily:', error);  // Log error for better debugging
//       res.status(500).json({ message: 'Failed to create family', error });
//     }
//   },
//   joinFamily: async (req, res) => {
//     const { Family, User } = mongoose.models;

//     const { joinCode } = req.body; // Allow joining by joinCode or name
//     const userId = req.user.id; // User ID from the authenticated user

//     try {
//         let family;

//         // Debug: Log inputs
//         console.log('Join Code:', joinCode);

//         // Find the family using joinCode if provided, otherwise use normalized name
//         if (joinCode) {
//             family = await Family.findOne({ joinCode });
//         }

//         if (!family) {
//             return res.status(404).json({
//                 error: 'Family not found. Please check the join code or name.',
//                 message: "קבוצה זו לא נמצאה. אנא בדוק את קוד הצטרפות ונסה שנית.",
//                 joinCode: joinCode || null,
//             });
//         }

//         // Check if the user is already a member of the family
//         if (family.members.includes(userId)) {
//             return res.status(400).json({
//                 error: 'User is already a member of this family',
//                 message: 'הינך כבר שייך לקבוצה זו',
//                 familyId: family._id,
//             });
//         }

//         // Add the user to the family's members
//         family.members.push(userId);
//         await family.save();

//         res.status(200).json({
//             message: `הצטרפת לקבוצה "${family.name}" בהצלחה`,
//             family: {
//                 id: family._id,
//                 name: family.name,
//                 members: family.members, // Return updated members
//             },
//         });
//     } catch (error) {
//         console.error('Error in joinFamily:', error); // Debug log
//         res.status(500).json({ message: 'ארעה שגיאה בעת הצטרפות לקבוצה. אנא נסה שנית.', error });
//     }
// },


//   getFamilyDetails: async (req, res) => {
//     const { Family, User } = mongoose.models;

//     const userId = req.user.id; // Extract user ID from JWT

//     try {
//       // Find the user and populate their family
//       const user = await User.findById(userId).populate('family');

//       if (!user.family) {
//         return res.status(404).json({ message: 'No family found for this user' });
//       }

//       // Find the family and populate its members
//       const family = await Family.findById(user.family._id).populate('members', 'email image fullName');

//       res.status(200).json({
//         family: {
//           id: family._id,
//           name: family.name,
//           members: family.members
//             ? family.members.map((member) => ({
//                 id: member._id,
//                 fullName: member?.fullName,
//                 image: member?.image,
//                 email: member.email,
//               }))
//             : [], // Ensure an empty array if no members exist
//           joinCode: family.joinCode,
//         },
//       });
//     } catch (error) {
//       console.error('Error in getFamilyDetails:', error);  // Log error for better debugging
//       res.status(500).json({ message: 'Failed to fetch family details', error });
//     }
//   },
// };
