import { getUser } from '../utils/auth';
import React, { useState , useEffect, useRef, useMemo} from "react";
import { useNavigate } from "react-router-dom";
import "./instructorpage.css";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Document, Page, pdfjs } from 'react-pdf';
import template from "../assets/AppendixA.pdf"
import ControlledEditor from '../utils/controlledEditor';
import Select from 'react-select';
import "react-pdf/dist/esm/Page/TextLayer.css";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


const InstructorPage = () => {
    //navigator
    const nav = useNavigate();    
    //grab user from getUser hook
    const user = getUser();
    //refs
    const outlineSelect = useRef();
    //state
    const [selectedFile, setSelectedFile] = useState(null);
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [numPages, setNumPages] = useState(null);
    const [resultText, setResultText] = useState(null);
    const [outlines, setOutlines] = useState([]);
    const [selectValue, setSelectValue] = useState();
    const [selectId, setSelectId] = useState();
    const [saveState, setSaveState] = useState(false);
    const [comment, setComment] = useState([]);

    useEffect(async () => {
        //user validation
        if (!user){
            nav("../");
            window.location.reload(true);
        }
        //grab all outlines belonging to user and store in state
        const resOutlines = await fetch(`/api/userOutlines/${user.email}`);
        if (resOutlines.ok) {
            const data = await resOutlines.json();
            setOutlines((outlines) => [...outlines, ...data])
        }
    }, []);

    // authentication methods
    const logout = () => {
        localStorage.removeItem("user");
        alert("You have been logged out")
        nav("../");
        window.location.reload(true);
    }

    // react-pdf helper methods
    function onDocumentLoadSuccess({numPages}) {
        setNumPages(numPages);
    }

    var GetFileBlobUsingURL = function (url, convertBlob) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.addEventListener('load', function() {
            convertBlob(xhr.response);
        });
        xhr.send();
    };

    var blobToFile = function (blob, name) {
            blob.lastModifiedDate = new Date();
            blob.name = name;
            return blob;
    };

    var GetFileObjectFromURL = function(filePathOrUrl, convertBlob) {
        GetFileBlobUsingURL(filePathOrUrl, function (blob) {
            convertBlob(blobToFile(blob, 'testFile.jpg'));
        });
    };
   
    const changeHandler = (event) => {
        setSelectedFile(event.target.files[0]);
        setIsFilePicked(true);
    };


    // build comments from state
    const mapComment = comment.map((data) => {
        <div class="comment-element" id={data._id}>
            <div class="comment-header-row">
                <div class="wrapper1" id={data.playlist_id}></div>

                <div class="wrapper 4" >
                    <input class="button" id="deleteComment" type="button" value={"Delete"} onClick/>
                    <input class="button" id="resolveComment" type="button" value={"Resolve"}/>
                </div>
            </div>
        </div>

    })

    // build options from state
    const generateOptions = useMemo(()=>{
        const optionsObj = []
        outlines.map((data , i)=>{
            const newOption = {value: data._id , label: data.courseCode , courseName: data.courseName , courseBody: data.outlineBody}
            optionsObj.push(newOption)
        })
        return optionsObj
    },[outlines])
    
    //user actions
    const save = () => {
        if (isFilePicked) {
            const file = new FormData();
            file.append("pdfFile",selectedFile);
            fetch("/api/converter",{
                method:"post",
                body: file
            }).then(response => {
                return response.text();
            }).then(extractedText => {
                setResultText(extractedText);
            });
            setIsFilePicked(false)
        }
    }

    const submit = async (e) => {
        setSaveState(true);
        window.location.reload(true);
        var timestamp = new Date();
        const submitObj = {
            outline: localStorage.getItem('savedContent'),
            date: timestamp,
        }
        fetch("/api/saveOutline", {
            method:"post",
            body: submitObj
        })
    }

    const loadTemplate = () => {
        setIsFilePicked(true);
        GetFileObjectFromURL(template, function (fileObject) {
            setSelectedFile(fileObject);
        });
    }

    return (
        <>
            <div class="app">
                <div class="topmenu">
                    <h1 class="managertitle">Course Outlines Manager</h1>
                    <div class="loginuser">Logged in as {user.name}
                        <input type="button" value="Log Out" onClick={logout}></input>
                    </div>
                </div>
                <div class="assignedcoursemenu">
                    <Tabs class="assigneddetail">
                        <TabList>
                            <Tab>
                                <div class="assignedcourses">Assigned Courses</div>
                            </Tab>
                        </TabList>
                        <TabPanel>
                            <table class="coursemenu">
                                <tr >
                                    <td>
                                        <div class="coname">Course Outline</div>
                                        <Select  ref={outlineSelect} options = {generateOptions} onChange={value => {
                                            setSelectValue(value.courseName)
                                            setSelectId(value.value)
                                            setResultText(value.courseBody)
                                            setIsFilePicked(true)
                                        }}></Select>
                                    </td>
                                    <td>
                                        <div class="crsname">Course Name</div>
                                        <div>{selectValue ? selectValue : "Not Selected"}</div>
                                    </td>
                                    <td>
                                        <div class="insName">Instructor Name</div>
                                        <div>{selectValue ? user.email : "Not Selected"}</div>
                                    </td>
                                </tr>
                            </table>
                            <br></br>
                        </TabPanel>
                    </Tabs>
                </div>
                <div class="comenu">
                    <Tabs>
                        <TabList>
                            <Tab>Current Outline</Tab>
                            <Tab>Outline Changes</Tab>
                            <Tab>Previous Outlines</Tab>
                        </TabList>
                        <TabPanel>
                            <input type="file" accept="application/pdf" onChange={changeHandler}></input>
                            <input type="button" onClick={loadTemplate} value = "From Template"></input>
                            <div class="courseoutlinetempdisplay" style ={{overflowY:"scroll", overflowX:"hidden"}}>
                            <Document file={selectedFile} onLoadSuccess={onDocumentLoadSuccess} onLoadError={console.error}>
                                {Array.apply(null, Array(numPages))
                                .map((x, i)=>i+1)
                                .map(page => <Page wrap={false} pageNumber={page} style={{height:"100%", width:"100%"}} />)}
                            </Document>
                            </div>
                            <input type="button" onClick={save} value = "Save"></input>
                        </TabPanel>
                        <TabPanel>
                            <div class="box">
                                <table class="outlinechanges">
                                    <tr>
                                        <td>
                                            <div class="courseoutlinetempdisplay2">
                                                <ControlledEditor onSave={saveState} htmlContent={resultText ? resultText : "No Outline Selected"} />
                                            </div>
                                        </td>
                                        <td>
                                            <div class="comment-wrapper">
                                                <div class="comment-content-box">
                                                    <div id="comment-header" class="comment-header">
                                                        <h1>Comments</h1>
                                                        <button>Add Comment</button>
                                                        <div class="comment-content">
                                                            <ul id="playlist-list">{mapComment}</ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <hr></hr>
                            <div class="box">
                                <table class="assessmentdisplay">
                                    <tr >
                                        <td>
                                            <input type="text" class="topicinput" placeholder="Topic"></input>
                                        </td>
                                        <td>
                                            <div class="dropdown">
                                                <b> Select a GA </b>
                                                {/* Not fully implemented yet, need to add ref to the select */}
                                                <select>
                                                    <option> ---Choose a GA--- </option>
                                                    <option> KB1</option>
                                                    <option> KB2 </option>
                                                    <option> KB3 </option>
                                                    <option> KB4 </option>
                                                    <option> PA1</option>
                                                    <option> PA2 </option>
                                                    <option> PA3 </option>
                                                    <option> I1 </option>
                                                    <option> I2</option>
                                                    <option> I3 </option>
                                                    <option> D1 </option>
                                                    <option> D2 </option>
                                                    <option> D3</option>
                                                    <option> D4 </option>
                                                    <option> ET1 </option>
                                                    <option> ET2 </option>
                                                    <option> ET3</option>
                                                    <option> ITW1 </option>
                                                    <option> ITW2 </option>
                                                    <option> ITW3 </option>
                                                    <option> CS1 </option>
                                                    <option> CS2 </option>
                                                    <option> CS3 </option>
                                                    <option> PR1 </option>
                                                    <option> PR2 </option>
                                                    <option> PR3 </option>
                                                    <option> IESE1 </option>
                                                    <option> IESE2 </option>
                                                    <option> IESE3 </option>
                                                    <option> EE1 </option>
                                                    <option> EE2 </option>
                                                    <option> EE3 </option>
                                                    <option> EE4 </option>
                                                    <option> EPM1 </option>
                                                    <option> EPM2 </option>
                                                    <option> EPM3 </option>
                                                    <option> EPM4 </option>
                                                    <option> LL1 </option>
                                                    <option> LL2 </option>
                                                </select>
                                            </div>
                                        </td>
                                        <td>
                                            {/* temp boilerplate for adding GAs */}
                                            <p> Added GA:  <div id="addedGA" class="addedGA">hi</div></p>
                                        </td>
                                    </tr>
                                </table>
                                <table>
                                    <tr>
                                        <textarea class="topicdescription">At the end of this section, students will be able to:
                                            a.
                                            b.     
                                        </textarea>  
                                        <input type="submit" value="Submit" id="submitOutline" onClick={submit}/>
                                    </tr>
                                </table>
                            </div>
                        </TabPanel>
                        <TabPanel>
                            {/* previous outlines panel */}
                        </TabPanel>
                    </Tabs>

                </div>
                <div >
                    <table class="COC">
                        {/* Changes table */}
                        {/* non-functional code for testing purposes */}
                        <tr class="coct">
                            <b>Course Outline Changes</b>
                        </tr>
                        <tr>Sent for review</tr>
                        <hr />
                        <div class="sentCOfile">asdfasfsd</div>
                        <hr />
                        <tr>Issues</tr>
                        <hr />
                        <div class="issueCOfile">asdfsdafsd</div>
                        <hr />
                        <tr>Approved</tr>
                        <hr />
                        <div class="approvedCOfile">asdfsdafsadf</div>
                    </table>
                </div>
            </div>
        </>
    );
};


export default InstructorPage;