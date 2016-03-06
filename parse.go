package main

import (
	"encoding/json"
	"fmt"
	"go/ast"
	"go/format"
	"go/parser"
	"go/token"
	//"reflect"
	//"golang.org/x/tools/go/ast/astutil"
	"bytes"
)

type ListNode struct {
	data int32
	next *ListNode
}

type Type struct {
	Literal string `json:"literal"`
	Struct  string `json:"struct"` // If this type is or wraps a struct, the name of that struct (name conflicts?)
}

type Package struct {
	Name  string `json:"name"`
	Files []File `json:"files"`
}

type File struct {
	Name    string   `json:"name"`
	Structs []Struct `json:"structs"`
}

type Struct struct {
	Name   string  `json:"name"`
	Fields []Field `json:"fields"`
	//Methods []Method `json:"methods"`
}

// TODO multiple names per field
type Field struct {
	Name string `json:"name"`
	Type Type   `json:"type"`
}

type Method struct {
	Name       string `json:"name"`
	ReturnType []Type `json:"returnType"`
}

type EdgeCasesStruct struct {
	x, y   int
	u      float32
	_      float32 // padding
	A      *[]int
	F      func()
	string // unnamed field
}

func test() {
	structs := GetStructsFileName("parse.go")
	structsJson, _ := json.Marshal(structs)
	fmt.Println(string(structsJson))
}

func GetStructsFile(fset *token.FileSet, f *ast.File, fname string) File {
	var structs []Struct
	//ast.Print(fset, f)
	// For all declarations
	for _, d := range f.Decls {
		if g, ok := d.(*ast.GenDecl); ok && g.Tok == token.TYPE {
			// For all type declarations
			for _, s := range g.Specs {
				if ts, ok := s.(*ast.TypeSpec); ok {
					if st, ok := ts.Type.(*ast.StructType); ok {
						var fields []Field
						for _, field := range st.Fields.List {
							// TODO: why can a field have multiple names?
							for _, name := range field.Names {
								// TODO: can the type be an expression?
								//fmt.Println(astutil.NodeDescription(field.Type))
								var buf bytes.Buffer
								if err := format.Node(&buf, fset, field.Type); err != nil {
									panic(err)
								}
								fieldtype := Type{Literal: string(buf.Bytes()), Struct: "TODO"}
								fi := Field{Name: name.Name, Type: fieldtype}
								fields = append(fields, fi)
							}
						}
						structs = append(structs, Struct{Name: ts.Name.Name, Fields: fields})
					}
				}
			}
		}
	}
	fmt.Printf("%d structs found\n", len(structs))
	return File{Name: fname, Structs: structs}
}

// TODO: don't deeply nest
// https://golang.org/ref/spec#Struct_types
func GetStructsFileName(filename string) File {
	fset := token.NewFileSet()

	f, err := parser.ParseFile(fset, filename, nil, 0)
	if err != nil {
		panic(err)
	}
	return GetStructsFile(fset, f, filename)
}

func GetStructsDirName(path string) []Package {
	var packages []Package
	fset := token.NewFileSet()

	packagemap, err := parser.ParseDir(fset, path, nil, 0)
	if err != nil {
		panic(err)
	}
	for packagename, packageval := range packagemap {
		var files []File
		for fname, f := range packageval.Files {
			files = append(files, GetStructsFile(fset, f, fname))
		}
		packages = append(packages, Package{Name: packagename, Files: files})
	}
	return packages
}

// Adds * for StarExpr, prints name for Ident, TODO: ignores other expressions
func GetTypeName(node ast.Expr) string {
	switch node.(type) {
	case *ast.Ident:
		return node.(*ast.Ident).Name
	case *ast.StarExpr:
		return "*" + GetTypeName(node.(*ast.StarExpr).X)
	default:
		return ""
	}
}
