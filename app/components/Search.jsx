const React = require('react');
// need connect function to be able to connect to store from Provider
const {connect} = require('react-redux');

const actions = require('actions');

class Search extends React.Component {
    constructor(props) {
        super(props);
        this.submitInput = this.submitInput.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    handleInput(event) {
        this.props.submitNewInput(event.target.value);
    }

    handleError(error) {
        this.props.handleNewError(error);
    }

    submitInput(e, word) {
        e.preventDefault();
        let searchWord = this.props.input || word;


        // API key
        // AIzaSyCCNymCGy8woooS7e6VBt4KLXt1UzAC6Pw 
        fetch('https://www.googleapis.com/books/v1/volumes?q=' + searchWord + '&key=AIzaSyCCNymCGy8woooS7e6VBt4KLXt1UzAC6Pw'
            + '&fields=items(volumeInfo(title,authors,publisher,imageLinks/smallThumbnail,infoLink))'
            )
            .then((res) => {
                if(!res.ok && res.status !== 200) {
                    throw Error(res.statusText);
                }

                return res.json();
                
            })
            .then((json) => {
                const booksArr = json.items.map((item) => item.volumeInfo);
                // need title, authors (array), imageLinks.smallThumbnail, publisher, infoLink
                this.props.storeNewBooks(booksArr);
                this.props.handleRemoveError();
                this.setStorage(searchWord);

            })
            .catch((err) => {
                    console.log(err);
                    this.handleError();
                }
            );
    }

    setStorage(searchWord) {
        // store in localStorage
        // localStorage only stores strings
        // refer to 
        // https://stackoverflow.com/questions/5410745/how-can-i-get-a-list-of-the-items-stored-in-html-5-local-storage-from-javascript
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
        const initList = window.localStorage.getItem('list') ? JSON.parse(window.localStorage.getItem('list')) : [];
        
        // Array.prototype.includes is case-sensitive
        // if result is already there, just switch its current index to the last one available
        if(initList.includes(searchWord.toLowerCase())) {
            // initList.splice
            initList.splice(initList.indexOf(searchWord.toLowerCase()),1);
        }
        
        // store only 10 query results in localStorage.
        // if 10, remove the oldest (or first) entry in array.
        if(initList.length === 10) {
            initList.shift();
        }

        initList.push(searchWord.toLowerCase());
        
        window.localStorage.setItem('list', JSON.stringify(initList));
        
        // need state so Recent component gets updated
        // basically just tells Redux store that we stored a new entry in localStorage.
        // need to clear this state again so Recent component will refresh.
        this.props.storeNewStorage();
    }

    render() {
        return (
            <div id='search'>
                <form onSubmit={this.submitInput}>
                    <input type="text" name="search" id="searchBar" onChange={this.handleInput}/>
                    <button id='submitBtn'>Submit</button>
                </form>
                
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return state.inputReducer;
};
  
const mapDispatchToProps = (dispatch) => {
    return {
        submitNewInput: (input) => {
            dispatch(actions.addInput(input))
        },
        storeNewBooks: (arr) => {
            dispatch(actions.storeBooks(arr))
        },
        handleNewError: (error) => {
            dispatch(actions.handleError())
        },
        handleRemoveError: () => {
            dispatch(actions.removeError())
        },
        storeNewStorage: () => {
            dispatch(actions.storeLocal())
        }
    }
}

  

const Container = connect(mapStateToProps, mapDispatchToProps)(Search);


module.exports = Container;