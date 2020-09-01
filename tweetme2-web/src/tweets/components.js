import React, { useEffect, useState } from 'react'

import { loadTweets } from '../lookup'

export function TweetsList(props) {
    const [tweets, setTweets] = useState([])

    useEffect(() => {
        // do my lookup here
        const myCallback = (response, status) => {
            console.log(response, status)
            if (status === 200) {
                setTweets(response)
            } else {
                alert("There was an error")
            }
        }
        loadTweets(myCallback)
    }, [])

    return tweets.map((item, index) => {
        return <Tweet tweet={item} key={`${index}-${item.id}`} className="my-5 py-5 border bg-dark text-white" />
    })
}

export function ActionBtn(props) {
    const { tweet, action } = props
    const [likes, setLikes] = useState(tweet.likes ? tweet.likes : 0)
    const [userLike, setUserLike] = useState(tweet.userLike === true ? true : false)
    const classname = props.className ? props.className : "btn btn-primary btn-sm"
    const actionDisplay = action.display ? action.display : 'Action'

    const handleClick = (event) => {
        event.preventDefault()
        if (action.type === 'like') {
            if (userLike) {
                setLikes(likes - 1)
                setUserLike(false)
            } else {
                setLikes(likes + 1)
                setUserLike(true)
            }
        }
    }

    const display = action.type === 'like' ? `${likes} ${actionDisplay}` : actionDisplay
    return <button className={classname} onClick={handleClick} >{display}</button>
}

export function Tweet(props) {
    const { tweet } = props
    const classname = props.className ? props.className : "col-10 mx-auto col-md-6"
    return <div className={classname}>
        <p>{tweet.id} - {tweet.content}</p>
        <div className="btn btn-group">
            <ActionBtn tweet={tweet} action={{ type: "like", display: "Likes" }} />
            <ActionBtn tweet={tweet} action={{ type: "unlike", display: "Unlike" }} />
            <ActionBtn tweet={tweet} action={{ type: "retweet", display: "Retweet" }} />
        </div>
    </div>
}