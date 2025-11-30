/* *
// upload file by stream
 */

package com.example.food_delivery.service.imp;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileServiceImp {
    boolean saveFile(MultipartFile file);
    Resource loadFile(String filename);
}
