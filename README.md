### Naver SmartEditor2 를 React Js + spring boot 환경에서 사용하는 예제 입니다.

>      [ 설정 방법 ]
>      1. SmartEditor/photo_uploader/popup/attach_photo.js 파일을 열어서
>      339 번째 Line 에  
>  
>      sUploadURL="http://localhost:9000/editor_upload";
>  
>      이 부분을 프로젝트 상황에 맞게 변경해야 Editor 에서 사진 업로드가 가능하다
> 
>      2. 개발시에 에디터에 사진을 표시되게 하려면 package.json 파일에  "proxy" 서버 설정이 필수이다.  
>
>      "proxy" : "백엔드 서버의 base url"
> 
>      아래는 spring boot 컨트롤러 예시 입니다.     

```java
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
```
