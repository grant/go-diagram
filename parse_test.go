package main

import (
	"encoding/json"
	"fmt"
	"go/ast"
	"testing"
)

func TestWriteClientPackages(t *testing.T) {
	clientpkgs, pkgmap := GetStructsDirName(".")
	WriteClientPackages("nono", pkgmap, clientpkgs)
}

// Test data structures and functions

type EdgeCasesStruct struct {
	x, y   int
	u      float32
	_      float32 // padding
	A      *[]int
	F      func()
	string // unnamed field
	B      *ast.Node
}

func test() {
	structs := GetStructsFileName("parse.go")
	structsJson, _ := json.Marshal(structs)
	fmt.Println(string(structsJson))
}

type ListNode struct {
	data int32
	next *ListNode
}
