from django.contrib.auth import get_user_model
from django.test import TestCase

from rest_framework.test import APIClient

from .models import Tweet

User = get_user_model()

# Create your tests here.
class TweetTestCase(TestCase):
    def setUp(self):
       self.user = User.objects.create(username='testUser', password='password')
       self.user2 = User.objects.create(username='testUser2', password='password')
       Tweet.objects.create(content="My First Tweet", user=self.user) 
       Tweet.objects.create(content="My Second Tweet", user=self.user) 
       Tweet.objects.create(content="My Third Tweet", user=self.user2) 
       self.currentCount = Tweet.objects.all().count()

    def test_tweet_created(self):
        tweet = Tweet.objects.create(content="My Fourth Tweet", user=self.user)
        self.assertEqual(tweet.id, 4)
        self.assertEqual(tweet.user, self.user)

    def get_client(self):
        client = APIClient()
        client.login(username=self.user.username, password='password')
        return client

    def test_tweet_list(self):
        client = self.get_client()
        response = client.get("/api/tweets/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 3)

    def get_force_authenticated_client(self):
        user = User.objects.get(username=self.user.username)
        client = APIClient()
        client.force_authenticate(user=user)
        return client

    def test_action_like(self):
        client = self.get_force_authenticated_client()
        response = client.post("/api/tweets/action/", {"id": 1, "action": "like"})
        self.assertEqual(response.status_code, 200)
        like_count = response.json().get("likes")
        self.assertEqual(like_count, 1)

    def test_action_unlike(self):
        client = self.get_force_authenticated_client()
        response = client.post("/api/tweets/action/", {"id": 2, "action": "like"})
        self.assertEqual(response.status_code, 200)
        like_count = response.json().get("likes")
        self.assertEqual(like_count, 1)
        response = client.post("/api/tweets/action/", {"id": 2, "action": "unlike"})
        self.assertEqual(response.status_code, 200)
        like_count = response.json().get("likes")
        self.assertEqual(like_count, 0)

    def test_action_retweet(self):
        client = self.get_force_authenticated_client()
        response = client.post("/api/tweets/action/", {"id": 2, "action": "retweet"})
        self.assertEqual(response.status_code, 201)
        data = response.json()
        new_tweet_id = data.get("id")
        self.assertNotEqual(new_tweet_id, 2)
        self.assertEqual(self.currentCount+1, new_tweet_id)

    def test_tweet_create_api_view(self):
        request_data = {"content": "This is my test tweet"}
        client = self.get_force_authenticated_client()
        response = client.post("/api/tweets/create/", request_data)
        self.assertEqual(response.status_code, 201)
        response_data = response.json()
        new_tweet_id = response_data.get("id")
        self.assertEqual(self.currentCount+1, new_tweet_id)

    def test_tweet_detail_api_view(self):
        client = self.get_force_authenticated_client()
        response = client.get("/api/tweets/1/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        id = data.get("id")
        self.assertEqual(id, 1)

    def test_tweet_delete_api_view(self):
        client = self.get_force_authenticated_client()
        response = client.delete("/api/tweets/1/delete/")
        self.assertEqual(response.status_code, 200)
        response = client.delete("/api/tweets/1/delete/")
        self.assertEqual(response.status_code, 404)
        response_incorrect_owner = client.delete("/api/tweets/3/delete/")
        self.assertEqual(response_incorrect_owner.status_code, 401)
