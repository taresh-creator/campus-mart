@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM
@REM Required ENV Vars:
@REM JAVA_HOME - location of a JDK home dir
@REM
@REM optional ENV vars
@REM MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM MAVEN_BATCH_PAUSE - set to 'on' to wait for a key stroke before ending
@REM MAVEN_OPTS - parameters to passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM MAVEN_SKIP_RC - flag to disable loading of mavenrc files
@REM ----------------------------------------------------------------------------

@REM Begin all REM lines with '@' in case MAVEN_BATCH_ECHO is 'on'
@echo off
@setlocal defaultCodepage

IF "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%

@REM set %ERROR_CODE% to 0 by default
SET ERROR_CODE=0

@REM ==== START VALIDATION ====
IF NOT "%JAVA_HOME%" == "" GOTO OkJHome

ECHO.
SET JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
IF "%ERRORLEVEL%" == "0" GOTO init

ECHO.
ECHO Error: JAVA_HOME not found in your environment. >&2
ECHO Please set the JAVA_HOME variable in your environment to match the >&2
ECHO location of your Java installation, or have java.exe in your PATH. >&2
ECHO.
GOTO error

:OkJHome
SET JAVA_EXE="%JAVA_HOME%\bin\java.exe"

:init

SET MAVEN_PROJECTBASEDIR=%~dp0
IF NOT "%MAVEN_PROJECTBASEDIR%" == "" GOTO endDetectBaseDir

SET EXEC_DIR=%CD%
SET WDIR=%EXEC_DIR%
:findBaseDir
IF EXIST "%WDIR%"\.mvn goto baseDirFound
cd ..
IF "%WDIR%"=="%CD%" GOTO baseDirNotFound
SET WDIR=%CD%
GOTO findBaseDir

:baseDirFound
SET MAVEN_PROJECTBASEDIR=%WDIR%
cd "%EXEC_DIR%"
GOTO endDetectBaseDir

:baseDirNotFound
SET MAVEN_PROJECTBASEDIR=%EXEC_DIR%
cd "%EXEC_DIR%"

:endDetectBaseDir

SET MAVEN_USER_HOME=%USERPROFILE%\.m2
SET MAVEN_HOME=%MAVEN_USER_HOME%\wrapper\dists\apache-maven-3.9.9\bin

IF EXIST "%MAVEN_HOME%\mvn.cmd" GOTO run

powershell -NoProfile -ExecutionPolicy Bypass -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $zip = Join-Path $env:TEMP 'apache-maven-3.9.9-bin.zip'; Write-Host 'Downloading Maven 3.9.9...'; Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip' -OutFile $zip; Write-Host 'Extracting Maven...'; Expand-Archive -Path $zip -DestinationPath (Join-Path $env:USERPROFILE '.m2\wrapper\dists') -Force; Remove-Item $zip; }"

:run
SET MAVEN_CMD="%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.9\bin\mvn.cmd"
IF EXIST %MAVEN_CMD% (
    CALL %MAVEN_CMD% %*
) ELSE (
    ECHO Failed to locate mvn.cmd
    GOTO error
)

IF ERRORLEVEL 1 GOTO error
GOTO end

:error
SET ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%
exit /B %ERROR_CODE%
