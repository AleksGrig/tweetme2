import React, { useEffect, useState } from 'react'

import { loadTweets } from '../lookup'

export function TweetsComponent(props) {
    const textAreaRef = React.createRef()
    const [newTweets, setNewTweets] = useState([])
    const handleSubmit = (event) => {
        event.preventDefault()
        const newVal = textAreaRef.current.value
        let tempNewTweets = [...newTweets]
        // change this to another server call
        tempNewTweets.unshift({
            content: newVal,
            likes: 0,
            id: 666
        })
        setNewTweets(tempNewTweets)
        textAreaRef.current.value = ''
    }
    return <div className={props.className}>
        <div className="col-12 mb-3">
            <form onSubmit={handleSubmit} >
                <textarea ref={textAreaRef} required={true} className="form-control bg-dark text-white" name="tweet">

                </textarea>
                <button className="btn btn-primary my-3">Tweet</button>
            </form>
        </div>
        <TweetsList newTweets={newTweets} />
    </div>
}

export function TweetsList(props) {
    const [tweetsInit, setTweetsInit] = useState([])
    const [tweets, setTweets] = useState([])
    const [tweetsDidSet, setTweetsDidSet] = useState(false)
    useEffect(() => {
        const final = [...props.newTweets].concat(tweetsInit)
        if (final.length !== tweets.length) {
            setTweets(final)
        }
    }, [props.newTweets, tweets, tweetsInit])
    useEffect(() => {
        if (tweetsDidSet === false) {
            // do my lookup here
            const myCallback = (response, status) => {
                if (status === 200) {
                    setTweetsInit(response)
                    setTweetsDidSet(true)
                } else {
                    alert("There was an error")
                }
            }
            loadTweets(myCallback)
        }
    }, [tweetsInit, tweetsDidSet, setTweetsDidSet])

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