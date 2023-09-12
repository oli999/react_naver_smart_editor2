/*
   [Naver SmartEditor2 사용방법]
  
   1. react public 폴더에 SmartEditor 폴더를 붙여 넣는다.
  
   2. src/editor/SmartEditor.js 를 import 해서 사용하고 싶은 컴포넌트에서 아래와 같이 사용한다.
    ----------------------------------------------------------------------------------------
 	const [editorTool, setEditorTool]=useState([]);

	useEffect(()=>{
		//initEditor() 함수를 호출하면서 SmartEditor 로 변환할 textarea 의 id 를 전달하면
        //<textarea id="content" rows="10"></textarea>
		//textarea 가 SmartEditor 로 변경되면서 에디터 tool 객체가 리턴된다.  
		setEditorTool(initEditor("content"));
	},[]);

    //폼 제출 버튼을 누르면 호출되는 함수 
	const handleSubmit=(e)=>{
		//에디터 tool 을 이용해서 SmartEditor 에 입력한 내용을 textarea 의 value 값으로 변환
		editorTool.exec();
		e.preventDefault();
		//textarea 입력한 value 읽어오기 
		
        //여기에서 ajax 요청을 통해 전송한다. 
	}
    ----------------------------------------------------------------------------------------
      
  
    3. SmartEditor/photo_uploader/popup/attach_photo.js 파일을 열어서
       339 번째 Line 에  
  
      sUploadURL="http://localhost:9000/editor_upload";
  
      이 부분을 프로젝트 상황에 맞게 변경해야 Editor 에서 사진 업로드가 가능하다 

       아래는 spring boot 컨트롤러 예시 입니다.
    ---------------------------------------------------------------------------------
    
    import java.io.File;
    import java.io.FileInputStream;
    import java.io.FileOutputStream;
    import java.io.IOException;
    import java.io.InputStream;
    import java.io.OutputStream;
    import java.text.SimpleDateFormat;
    import java.util.UUID;
    import javax.servlet.http.HttpServletRequest;
    import org.apache.commons.io.IOUtils;
    import org.springframework.beans.factory.annotation.Value;
    import org.springframework.http.MediaType;
    import org.springframework.stereotype.Controller;
    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.PathVariable;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.ResponseBody;

    @Controller
    public class SmartEditorController {
        
        //업로드된 이미지를 저장할 서버의 경로 읽어오기 
        @Value("${file.location}")
        private String fileLocation; 
        
        //ajax 업로드 요청에 대해 응답을 하는 컨트롤러 메소드
        @RequestMapping("/editor_upload")
        @ResponseBody
        public String upload(HttpServletRequest request) throws IOException {
            //파일정보
            String sFileInfo = "";
            //파일명을 받는다 - 일반 원본파일명
            String filename = request.getHeader("file-name");
            //파일 확장자
            String filename_ext = filename.substring(filename.lastIndexOf(".") + 1);
            //확장자를소문자로 변경
            filename_ext = filename_ext.toLowerCase();
        
            //이미지 검증 배열변수
            String[] allow_file = { "jpg", "png", "bmp", "gif" };
        
            //돌리면서 확장자가 이미지인지 
            int cnt = 0;
            for (int i = 0; i < allow_file.length; i++) {
                if (filename_ext.equals(allow_file[i])) {
                    cnt++;
                }
            }
        
            //이미지가 아님
            if (cnt == 0) {
                
                //out.println("NOTALLOW_" + filename);
                return "NOTALLOW_" + filename;
            } else {
                //이미지이므로 신규 파일로 디렉토리 설정 및 업로드   
                
                //파일 기본경로 _ 상세경로
                String filePath = fileLocation + File.separator;
                File file = new File(filePath);
                if (!file.exists()) {
                    file.mkdirs();
                }
                String realFileNm = "";
                SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
                String today = formatter.format(new java.util.Date());
                realFileNm = today + UUID.randomUUID().toString() + filename.substring(filename.lastIndexOf("."));
                String rlFileNm = filePath + realFileNm;
                ///////////////// 서버에 파일쓰기 ///////////////// 
                InputStream is = request.getInputStream();
                OutputStream os = new FileOutputStream(rlFileNm);
                int numRead;
                byte b[] = new byte[Integer.parseInt(request.getHeader("file-size"))];
                while ((numRead = is.read(b, 0, b.length)) != -1) {
                    os.write(b, 0, numRead);
                }
                if (is != null) {
                    is.close();
                }
                os.flush();
                os.close();
                ///////////////// 서버에 파일쓰기 /////////////////
                String contextPath=request.getContextPath();
                // 업로드된 이미지의 정보를 클라이언트에게 출력
                sFileInfo += "&bNewLine=true";    
                sFileInfo += "&sFileName=" + filename;    
                sFileInfo += "&sFileURL=/editor/images/"+realFileNm;
                //out.println(sFileInfo);
                System.out.println(sFileInfo);
                return sFileInfo;
            }
        }
        //업로드된 이미지를 출력해주는 컨트롤러 메소드 
        @GetMapping(
                value="/editor/images/{imageName}",
                produces = {MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE, 
                        MediaType.IMAGE_GIF_VALUE}
        )
        @ResponseBody
        public byte[] editorImage(@PathVariable("imageName") String imageName) throws IOException {
            
            String absolutePath=fileLocation+File.separator+imageName;
            //파일에서 읽어들일 InputStream
            InputStream is=new FileInputStream(absolutePath);
            // 이미지 데이터(byte) 를 읽어서 배열에 담아서 클라이언트에게 응답한다.
            return IOUtils.toByteArray(is);
        }	
            
    }       
*/
function initEditor(id="content"){
   
    if(typeof window.nhn=='undefined'){
        window.nhn = {};
    } 
    if (!window.nhn.husky){
        window.nhn.husky = {};
    } 

    var nhn=window.nhn;
    /**
     * @fileOverview This file contains application creation helper function, which would load up an HTML(Skin) file and then execute a specified create function.
     * @name HuskyEZCreator.js
     */
    nhn.husky.EZCreator = new (function(){
        this.nBlockerCount = 0;

        this.createInIFrame = function(htOptions){
        if(arguments.length == 1){
            var oAppRef = htOptions.oAppRef;
            var elPlaceHolder = htOptions.elPlaceHolder;
            var sSkinURI = htOptions.sSkinURI;
            var fCreator = htOptions.fCreator;
            var fOnAppLoad = htOptions.fOnAppLoad;
            var bUseBlocker = htOptions.bUseBlocker;
            var htParams = htOptions.htParams || null;
        }else{
            // for backward compatibility only
            var oAppRef = arguments[0];
            var elPlaceHolder = arguments[1];
            var sSkinURI = arguments[2];
            var fCreator = arguments[3];
            var fOnAppLoad = arguments[4];
            var bUseBlocker = arguments[5];
            var htParams = arguments[6];
        }

        if(bUseBlocker) nhn.husky.EZCreator.showBlocker();

        var attachEvent = function(elNode, sEvent, fHandler){ 
            if(elNode.addEventListener){
            elNode.addEventListener(sEvent, fHandler, false);
            }else{
            elNode.attachEvent("on"+sEvent, fHandler);
            }
        } 

        if(!elPlaceHolder){
            alert("Placeholder is required!");
            return;
        }

        if(typeof(elPlaceHolder) != "object")
            elPlaceHolder = document.getElementById(elPlaceHolder);

        var elIFrame, nEditorWidth, nEditorHeight;
        

        try{
            elIFrame = document.createElement("<iframe frameborder=0 scrolling=no>");
        }catch(e){
            elIFrame = document.createElement("iframe");
            elIFrame.setAttribute("frameborder", "0");
            elIFrame.setAttribute("scrolling", "no");
        }
        
        elIFrame.style.width = "1px";
        elIFrame.style.height = "1px";
        console.log(elPlaceHolder.parentNode);
        elPlaceHolder.parentNode.insertBefore(elIFrame, elPlaceHolder.nextSibling);
        
        attachEvent(elIFrame, "load", function(){
            fCreator = elIFrame.contentWindow[fCreator] || elIFrame.contentWindow.createSEditor2;
                
        
                try{
                
                    nEditorWidth = elIFrame.contentWindow.document.body.scrollWidth || "500px";
                    nEditorHeight = elIFrame.contentWindow.document.body.scrollHeight + 12;
                    elIFrame.style.width =  "100%";
                    elIFrame.style.height = nEditorHeight+ "px";
                    elIFrame.contentWindow.document.body.style.margin = "0";
                }catch(e){
                    nhn.husky.EZCreator.hideBlocker(true);
                    elIFrame.style.border = "5px solid red";
                    elIFrame.style.width = "500px";
                    elIFrame.style.height = "500px";
                    alert("Failed to access "+sSkinURI);
                    return;
                }
                
                var oApp = fCreator(elPlaceHolder, htParams);	// oEditor
                

                oApp.elPlaceHolder = elPlaceHolder;

                oAppRef[oAppRef.length] = oApp;
                if(!oAppRef.getById) oAppRef.getById = {};
                
                if(elPlaceHolder.id) oAppRef.getById[elPlaceHolder.id] = oApp;

                oApp.run({fnOnAppReady:fOnAppLoad}); 
                
    //			top.document.title += ", "+((new Date())-window.STime);
                nhn.husky.EZCreator.hideBlocker();
            });
    //		window.STime = new Date();
            elIFrame.src = sSkinURI;
            this.elIFrame = elIFrame;
        };
        
        this.showBlocker = function(){
            if(this.nBlockerCount<1){
                var elBlocker = document.createElement("div");
                elBlocker.style.position = "absolute";
                elBlocker.style.top = 0;
                elBlocker.style.left = 0;
                elBlocker.style.backgroundColor = "#FFFFFF";
                elBlocker.style.width = "100%";

                document.body.appendChild(elBlocker);
                
                nhn.husky.EZCreator.elBlocker = elBlocker;
            }

            nhn.husky.EZCreator.elBlocker.style.height = Math.max(document.body.scrollHeight, document.body.clientHeight)+"px";
            
            this.nBlockerCount++;
        };
        
        this.hideBlocker = function(bForce){
            if(!bForce){
                if(--this.nBlockerCount > 0) return;
            }
            
            this.nBlockerCount = 0;
            
            if(nhn.husky.EZCreator.elBlocker) nhn.husky.EZCreator.elBlocker.style.display = "none";
        }
    })();


    //추가 글꼴 목록
    //var aAdditionalFontSet = [["MS UI Gothic", "MS UI Gothic"], ["Comic Sans MS", "Comic Sans MS"],["TEST","TEST"]];
    
    const oEditors=[];

    window.nhn.husky.EZCreator.createInIFrame({
        oAppRef: oEditors,
        elPlaceHolder: id,
        sSkinURI: "/SmartEditor/SmartEditor2Skin.html",	
        htParams : {
            bUseToolbar : true,				// 툴바 사용 여부 (true:사용/ false:사용하지 않음)
            bUseVerticalResizer : true,		// 입력창 크기 조절바 사용 여부 (true:사용/ false:사용하지 않음)
            bUseModeChanger : true,			// 모드 탭(Editor | HTML | TEXT) 사용 여부 (true:사용/ false:사용하지 않음)
            //aAdditionalFontList : aAdditionalFontSet,		// 추가 글꼴 목록
            fOnBeforeUnload : function(){
                //alert("완료!");
            }
        }, //boolean
        fOnAppLoad : function(){
            //예제 코드
            //oEditors.getById["ir1"].exec("PASTE_HTML", ["로딩이 완료된 후에 본문에 삽입되는 text입니다."]);
        },
        fCreator: "createSEditor2"
    });
    
    function pasteHTML() {
        var sHTML = "<span style='color:#FF0000;'>이미지도 같은 방식으로 삽입합니다.<\/span>";
        oEditors.getById[id].exec("PASTE_HTML", [sHTML]);
    }
    
    function showHTML() {
        var sHTML = oEditors.getById[id].getIR();
        alert(sHTML);
    }
    
    function setDefaultFont() {
        var sDefaultFont = '궁서';
        var nFontSize = 24;
        oEditors.getById[id].setDefaultFont(sDefaultFont, nFontSize);
    }
    // SmartEditor 에 입력한 내용을 textarea 에 변환하는 함수 
    oEditors.exec = function(){
        this.getById[id].exec("UPDATE_CONTENTS_FIELD", []);
    }

    return oEditors;
}

export {initEditor} 