import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { 
	BarChart,
	LineChart,
	PieChart,
	RadarChart,
    CartesianGrid,
    XAxis,
	YAxis,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
    Tooltip,
    Legend,
	Bar,
	Pie,
	Radar,
	Line,
	Label
} from 'recharts'

import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid'
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Modal from 'material-ui/Modal'

import Webcam from 'react-webcam';

import Person from './components/person'

class App extends Component {
	
	constructor(props){
		super(props)
		if (!("webkitSpeechRecognition" in window)){
			this.state = {
				running : false,
				support : false,
			}
		} else {
			this.recognition = new window.webkitSpeechRecognition()
			this.state = {
				modalOpen: false,
				emotionData: [],
				emotionDataList: [],
				sentimentData: [],
				faceEmotionData: [],
				faceEmotionDataList: [],
				keywords: [],
				running : false,
				support : true,
				identifiedTextList: [],
			}
			this.recognition.onstart = () => {
				// console.log("Start")
				this.setState({running: true})
			}
			this.recognition.onerror = () => {
				// console.log("Error Occured")
				this.setState({running: false})
			}
			this.recognition.onend = () => {
				// console.log("Ended")
				this.setState({running: false})
				if (!this.state.running && !this.state.forceEnd){
					this.setState({running: true})
					this.recognition.start()
				}
				if (this.state.forceEnd) this.setState({forceEnd: false})
			}
			this.recognition.onresult = (event) => {
				// event is a SpeechRecognitionEvent object.
				// It holds all the lines we have captured so far.
				// We only need the current one.
				var current = event.resultIndex;

				// Get a transcript of what was said.
				var transcript = event.results[current][0].transcript;

				// Add the current transcript to the contents of our Note.
				var noteContent = ""
				noteContent += transcript;
				this.getEmotion(noteContent).then((result) => console.log(result) )
				this.setState((prevState) => { identifiedTextList: prevState.identifiedTextList.push(noteContent) })
			}
		}

		setInterval(async () => {
			if (this.state.running){
				var base64 = this.capture()
				await fetch('https://nltk-api.herokuapp.com/image', {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						"base64": base64
					})
				})
				.then((response) => response.json())
				.then((responseJson) => {
					responseJson = JSON.parse(responseJson)

					var data = []
					for(var prop in responseJson[0].scores) {
						data.push({
							"name": prop,
							"value": responseJson[0].scores[prop]
						})
					}

					this.setState({faceEmotionData: data})
					this.setState((prevState) => {{ faceEmotionDataList: prevState.faceEmotionDataList.push(data) }})
					// this.setState((prevState) => {{ faceEmotionData: prevState.faceEmotionData.push(responseJson[0].scores) }})
				})
				.catch((error) => {
				})
			}
		}, 1000)
	}

	modalOpen = () => {
		this.setState({modalOpen: true})
	}

	modalClose = () => {
		this.setState({modalOpen: false})
	}

	async getEmotion(noteContent) {
		await fetch('https://nltk-api.herokuapp.com/result', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				text: noteContent
			})
		})
		.then((response) => response.json())
		.then((responseJson) => {
			var data = responseJson[1].probabilities
			var emotionGraphData = []
			for (var p in data) {
				if (data.hasOwnProperty(p)){
					var temp = {
						"name" : p,
						"value" : data[p]
					}
					emotionGraphData.push(temp)
				}
			}
			this.setState({emotionData: emotionGraphData})
			this.setState((prevState) => {{ emotionDataList: prevState.emotionDataList.push(emotionGraphData) }})

			data = responseJson[2].probabilities
			temp = {
				"name" : "",
				"positive" : data.positive,
				"neutral" : data.neutral,
				"negative" : data.negative,
			}
			var prevSentimentData = this.state.sentimentData
			prevSentimentData.push(temp)
			this.setState({sentimentData: prevSentimentData})

			console.log(responseJson[0])

			data = responseJson[0].keywords
			temp = []
			for(var i = 0; i < data.length; i++) {
				temp.push(data[i])
			}
			this.setState({keywords: temp})

			return responseJson
		})
		.catch((error) => {
			console.log(error)
		})
	}

	renderPerson(){
		return (
			<Person 
				messages = { this.state.identifiedTextList }
			/>
		)
	}

	renderBarGraph(){
		return (
			<BarChart width={530} height={250} data={ this.state.emotionData }>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
				<Label value="Textual Emotion Analysis" offset={0} position="bottom" />
                <Bar name="Intensity of Emotion" dataKey="value" fill="#82ca9d" />
            </BarChart>
		)
	}

	renderLineGraph(){
		return (
			<LineChart width={400} height={250} data={ [...this.state.sentimentData] } margin={{top: 5, right: 30, left: 20, bottom: 5}}>
				<XAxis dataKey="name"/>
				<YAxis/>
				<CartesianGrid strokeDasharray="3 3"/>
				<Tooltip/>
				<Legend />
				<Label value="Textual Sentimental Analysis" offset={0} position="bottom" />
				<Line type="monotone" dataKey="positive" stroke="#8884d8" activeDot={{r: 8}}/>
				<Line type="monotone" dataKey="neutral" stroke="#82ca9d" activeDot={{r: 8}}/>
				<Line type="monotone" dataKey="negative" stroke="#FF0000" activeDot={{r: 8}}/>
				{/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
			</LineChart>
		)
	}

	renderPieGraph() {
		return (
			<BarChart width={600} height={250} data={ this.state.faceEmotionData }>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="name" />
				<YAxis />
				<Tooltip />
				<Legend />
				<Label value="Visual Emotion Analysis" offset={0} position="bottom" />
				<Bar name="Intensity of Emotion" dataKey="value" fill="#82ca9d" />
			</BarChart>
		)
	}

	renderKeywords(){
		return (
			<div>
				<h4>Keywords</h4>
				<ol>
					{
						this.state.keywords.map((data, i) => (
							<li key = {i}> {data} </li>
						))
					}
				</ol>
			</div>
		)
	}

	setWebcamRef = (webcam) => {
		this.webcam = webcam;
	}
	
	capture = () => {
		const imageSrc = this.webcam.getScreenshot();
		return imageSrc
	}

	renderWebCam(){
		return (
			<div>
				<Webcam
					audio={false}
					height={135}
					ref={this.setWebcamRef}
					screenshotFormat="image/jpeg"
					width={150}
				/>
			</div>
		)
	}

	renderResultGraph(){
		if (this.state.emotionAverage && this.state.faceAverage){
			var data = []
			// anger
			data.push({
				"name" : "anger",
				"value" : this.state.emotionAverage.angry*0.5 + this.state.faceAverage.anger*0.5
			})
			//sad
			data.push({
				"name" : "sad",
				"value" : this.state.emotionAverage.sad*0.5 + this.state.faceAverage.sadness*0.50
			})
			//neutral
			data.push({
				"name" : "neutral",
				"value" : this.state.emotionAverage.indifferent*0.5 + this.state.faceAverage.neutral*0.5
			})
			//amazed
			data.push({
				"name" : "amazed",
				"value" : this.state.emotionAverage.excited*0.5 + this.state.faceAverage.surprise*0.50
			})
			//fear
			data.push({
				"name" : "fear",
				"value" : this.state.faceAverage.fear
			})
			//disgust
			data.push({
				"name" : "disgust",
				"value" : this.state.faceAverage.contempt + this.state.faceAverage.disgust
			})
			//happy
			data.push({
				"name" : "happy",
				"value" : this.state.emotionAverage.happy*0.5 + this.state.faceAverage.happiness*0.5
			})

			return(
				<RadarChart outerRadius={90} width={730} height={250} data={data}>
					<PolarGrid />
					<PolarAngleAxis dataKey="name" />
					<PolarRadiusAxis angle={30} />
					<Radar name="Intensity" dataKey="value" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
					<Legend />
				</RadarChart>
			)
		}
		return (
			<div>
			</div>
		)

	}

	renderButtons(){
		if (this.state.support){
			if (this.state.running)
				return (
					<Button 
					raised 
					color="secondary" 
					onClick = { () => { 
						if (!this.state.forceEnd){
							this.setState({forceEnd: true})

							var faceAverage = {}
							this.state.faceEmotionDataList.map((data, i) => {
								data.map((data, i) => {
									if (data.name in faceAverage){
										faceAverage[data.name] = (faceAverage[data.name] + data.value)/2
									} else {
										faceAverage[data.name] = data.value
									}
								})
							})
							this.setState({faceAverage: faceAverage})

							var emotionAverage = {}
							this.state.emotionDataList.map((data, i) => {
								data.map((data, i) => {
									if (data.name in emotionAverage){
										emotionAverage[data.name] = (emotionAverage[data.name] + data.value)/2
									} else {
										emotionAverage[data.name] = data.value
									}
								})
							})
							this.setState({emotionAverage: emotionAverage})
						}
						this.recognition.stop()
						this.modalOpen()
					} }>
						Stop !
					</Button>
				)
			else {
				return (
					<Button 
						raised 
						color="primary" 
						onClick = { () => { this.recognition.start() } }
					>
						Start
					</Button>
			
				)
			}
		} else {
			return (
				<p> Not Supported </p>
			)
		}
	}

	render() {
		const card = {
			"background-color": "#a09c9c"
		}

		return (
			<div className="App" style = {{ padding: 40 }}>

				<Grid container>
					<Grid item xs = {12} >
						<Grid container justify="center" spacing={16}>
							<Grid item>
								<Card style = {{ height: 340 }} className = {card}>
									<CardContent>
										{ this.renderButtons() }
										{ this.renderPerson() }
									</CardContent>
								</Card>
							</Grid>
							<Grid item>
								<Card className = {card} style = {{ maxHeight: 340 }}>
									<CardContent>
										{ this.renderWebCam() }
										{ this.renderKeywords() }
									</CardContent>
								</Card>
							</Grid>
							<Grid item>
								<Card className = {card}>
									<CardContent>
										{ this.renderBarGraph() }	
										<p>Textual Emotion Analysis</p>
									</CardContent>
								</Card>
							</Grid>
						</Grid>
					</Grid>
					<Grid item xs = {12}>
						<Grid container justify="center" spacing={16}>
							<Grid item >
								<Card className = {card}>
									<CardContent>
										{ this.renderLineGraph() }
										<p>Textual Sentimental Analysis</p>
									</CardContent>
								</Card>
							</Grid>
							<Grid item >
								<Card className = {card}>
									<CardContent>
										{ this.renderPieGraph() }
										<p>Visual Emotion Analysis</p>
									</CardContent>
								</Card>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
				<Modal
					aria-labelledby="simple-modal-title"
					aria-describedby="simple-modal-description"
					open={this.state.modalOpen}
					onClose={this.modalClose}
				>
					<Card style = {{ 
						height: 400, 
						width: 800,
						position: "absolute",
						top: 150,
						left: 300,
					}}>
						<CardContent>
							<h4> Result </h4>
							{ this.renderResultGraph() }
						</CardContent>
					</Card>
				</Modal>
			</div> 
		);
	}
}

export default App;
