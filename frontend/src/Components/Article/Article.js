import React from 'react';
import './articles.css';
//import classNames from 'classnames';
var classNames = require('classnames');


var Article = React.createClass({
    getInitialState() {
        return { expanded: false };
    },
    toggleExpand: function (e) {
        console.log(this.state.expanded);
        this.setState({ expanded: !this.state.expanded });
    },
    render: function () {
        var details = this.props.details,
            styles = {
                //backgroundColor: details.color
            },
            npmClassnames = classNames('btn', this.props.className, {
                'btn-pressed': this.state.isPressed,
                'btn-over': !this.state.isPressed && this.state.isHovered
            }),
            classArray = [
                'article',
                this.state.expanded ? 'article--expanded' : '',
                details.type === "secondary" ? 'article--secondary' : '',
            ];
        console.log("OPPONENTS", this.props.opponents, this.opponents);
        // if(this.props.opponents){
        //     opponents = this.props.opponents.map((x) => {
        //     return (
        //         <Article author={x.author} body={x.body} />
        //     )
        // })

        var losses = [],
            wins = [];
        if (details.wins && details.losses) {

            details.losses.forEach(function (item, i) {
                var roundString = item.method.indexOf("Decision") > -1 ? "" : "round " + item.round;
                var way = " [" + item.method + ", " + roundString + "]";
                losses.push(<p key={i}>{item.year + ": " + item.result + " vs " + item.opponentName + way}</p>);

            });
            details.wins.forEach(function (item, i) {
                var roundString = item.method.indexOf("Decision") > -1 ? "" : "round " + item.round;
                var way = " [" + item.method + ", " + roundString + "]";

                wins.push(<p key={i}>{item.year + ": " + item.result + " vs " + item.opponentName + way}</p>);
            });
        }

        var fightsHtml = [];
        if (details.fightHistory) {
            fightsHtml = details.fightHistory.map((item, i) => {
                var colorStyles = {
                    color: item.method === "win" ? 'green' : 'red'
                };
                var roundString = item.method.indexOf("Decision") > -1 ? "" : "round " + item.round;
                var way = " [" + item.method + ", " + roundString + "]";
                return (<p style={styles} key={i} > {item.year + ": " + item.result + " vs " + item.opponentName + way}</p >);
            });
        }

        return (
            <article className={classArray.join(' ')} onClick={this.toggleExpand}>
                <section className="article__header">
                    <h3 className="article__category" style={styles}>{details.association}</h3>
                    {
                        details.relatedTo !== "" &&
                        <p className="article__related">>> {details.relatedTo} </p>
                    }
                    <h2 className="article__title">{details.name}</h2>
                    <img src={details.image} />
                    <div className="details">
                        <span>Age: {details.age}</span>
                        <span>{details.height_cm} cm</span>
                        <span>{details.weight_kg} kg</span>
                    </div>
                    <WinsAndLosses type={details.type} wins={wins} losses={losses} />
                </section>

                <section className="article__description">
                    {/*{fightsHtml}*/}
                    <div>details.opponents.length</div>
                    <FightHistory type={details.fightHistory} />
                </section>
            </article>
        )
    },
    componentDidMount: function () {
    },

});

function WinsAndLosses(props) {
    if (props.type === "secondary") {
        return null;
    }

    return (
        <div className="fights">
            <header>Wins</header>
            {props.wins}
            <header>Losses</header>
            {props.losses}
        </div>
    );
}

function FightHistory(props) {
    if (!props.fightHistory) {
        return null;
    }
    return props.fightHistory.map((item, i) => {
        console.log(item);
        var colorStyles = {
            color: item.method === "win" ? 'darkgreen' : 'crimson'
        };
        var roundString = item.method.indexOf("Decision") > -1 ? "" : "round " + item.round;
        var way = " [" + item.method + ", " + roundString + "]";
        var result = <span style={colorStyles}>item.result</span>;
        return (<p key={i} > {item.year + ": " + result + " vs " + item.opponentName + way}</p >);
    });
}

export default Article;