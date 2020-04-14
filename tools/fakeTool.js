import auth from "@react-native-firebase/auth";
import { db } from "../App.js";
import faker from "faker";
import { randomizerNumber, randomizerArray } from "./randomizerTool.js";

export async function createFakeProfiles(numbersOfProfiles) {
  for (let i = 0; i < numbersOfProfiles; i++) {
    const newUser = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      displayName: faker.name.findName(),
      phone: faker.phone.phoneNumberFormat(),
      photoURL: faker.image.avatar(),
      tokenId: faker.random.uuid(),
    };
    // create and log user
    await auth().createUserWithEmailAndPassword(
      newUser.email,
      newUser.password,
    );

    // log out user
    await auth().signOut();

    // create doc into user collection with new user
    await db.collection("users").add({
      identity: {
        displayName: newUser.displayName,
        firstName: faker.name.firstName(),
        email: newUser.email,
        phone: newUser.phone,
        age: randomizerNumber([13, 45]),
        gender: randomizerArray(["male", "female", "non-binary"]),
        sexualOrientation: randomizerArray([
          "hetero",
          "homo",
          "bi",
          "pan",
          "other",
        ]),
        job: faker.name.jobTitle(),
        hobbies: randomizerArray(
          [
            "foot",
            "gaming",
            "cook",
            "shopping",
            "nature",
            "tech",
            "sport",
            "dessin",
          ],
          3,
        ),
        city: faker.address.city(),
        country: faker.address.country(),
        photos: [
          faker.image.avatar(),
          faker.image.avatar(),
          faker.image.avatar(),
        ],
        bio: faker.lorem.paragraph(),
      },
      whatIWant: {
        gender: randomizerArray(["male", "female", "non-binary"]),
        sexualOrientation: randomizerArray([
          "hetero",
          "homo",
          "bi",
          "pan",
          "other",
        ]),
        ageRange: [randomizerNumber([12, 18]), randomizerNumber([19, 30])],
        hobbies: randomizerArray(
          [
            "foot",
            "gaming",
            "cook",
            "shopping",
            "nature",
            "tech",
            "sport",
            "dessin",
          ],
          4,
        ),
        country: faker.address.country(),
        city: faker.address.city(),
      },
      match: {
        like: [faker.random.uuid(), faker.random.uuid(), faker.random.uuid()],
        refuse: [faker.random.uuid(), faker.random.uuid(), faker.random.uuid()],
        likeReciprocal: [
          faker.random.uuid(),
          faker.random.uuid(),
          faker.random.uuid(),
        ],
      },
      permissions: {
        ghosted: false,
        verified: false,
        profileComplete: false,
      },
    });
  }
}

/* user model
 *
 * user = {
 *   identity: {
 *     displayName: string
 *     firstName: string
 *     email: string
 *     phone: string
 *     age: number | number[] // soit l'age soit une fourchette
 *     gender: "male" | "female" | "non-binary"
 *     sexualOrientation: "hétéro" | "Homo" | "Bi" | "Pan" | "other"
 *     job: string
 *     hobbies: string[]
 *     city: string
 *     country: string
 *     photos: string[] // url des photos dans un tableau dans l'ordre d'apparition sur l'app
 *     bio: string
 *   },
 *   whatIWant: {
 *     gender: "male" | "female" | "non-binary"
 *     sexualOrientation: "hétéro" | "Homo" | "Bi" | "Pan" | "other"
 *     ageRange: number[]
 *     hobbies: string[]
 *     country: string
 *     city: string
 *   },
 *   match: {
 *     like: string[] // l'id des personnes liké
 *     refuse: string[] // l'id des personnes refusé
 *     likeReciprocal: string[] // l'id des personnes que j'ai liké et qui m'on liké
 *   },
 *   permissions: {
 *    ghosted: boolean,
 *    verified: boolean,
 *    profileComplete: boolean,
 *   }
 * }
 */
