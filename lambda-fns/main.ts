import addFriend from './addFriend';
import createPerson from './createPerson';
import friendOfFriends from './friendOfFriends';
import addRestaurant from './addRestaurant'
import listFriends from './listFriends';
import ListPersons from './ListPersons';
import Person from './Person';
import RestaurantInput from './Restaurant'
import addReview from './addReview';
import addCuisine from './addCuisine'
import ReviewInput from './Review'
import CuisineInput from './Cuisine'


type AppSyncEvent = {
  info: {
    fieldName: string
  },
  arguments: {
    person: Person
    PersonID: string
    Person1ID: string
    Person2ID: string
    restaurant: RestaurantInput
    review: ReviewInput
    cuisine: CuisineInput
  }
}
exports.handler = async (event: AppSyncEvent) => {
  switch (event.info.fieldName) {
    case "ListPersons":
      return await ListPersons();
    case "FriendofFriends":
      return await friendOfFriends(event.arguments.PersonID);
    case "PersonFriends":
      return await listFriends(event.arguments.PersonID);
    case "addFriend":
      return await addFriend(event.arguments.Person1ID, event.arguments.Person2ID);
    case "createPerson":
      return await createPerson(event.arguments.person);
    case "addRestaurant":
      return await addRestaurant(event.arguments.restaurant);
    case "createReview":
      return await addReview(event.arguments.review);
    case "addCuisine":
      return await addCuisine(event.arguments.cuisine)
    default:
      return null;
  }
}