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

//type Type string

type ListNode struct {
	data int32
	next *ListNode
}

type StructInfo struct {
	Name    string   `json:"name"`
	Fields  []Field  `json:"fields"`
	Methods []Method `json:"methods"`
}

// TODO multiple names per field
type Field struct {
	Name string `json:"names`
	Type string `json:"type"`
}

type Method struct {
	Name       string `json:"name`
	ReturnType string `json:"returnType"`
}

type EdgeCasesStruct struct {
	x, y int
	u    float32
	_    float32 // padding
	A    *[]int
	F    func()
	string	// unnamed field
}

func test() {
	structs := GetStructs("parse.go")
	structsJson, _ := json.Marshal(structs)
	fmt.Println(string(structsJson))
}

// TODO: don't deeply nest
// https://golang.org/ref/spec#Struct_types
func GetStructs(file string) []StructInfo {
	var structs []StructInfo
	fset := token.NewFileSet()

	f, err := parser.ParseFile(fset, file, nil, 0)
	if err != nil {
		panic(err)
	}
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
								fi := Field{Name: name.Name, Type: string(buf.Bytes())}
								fields = append(fields, fi)
							}
						}
						structs = append(structs, StructInfo{Name: ts.Name.Name, Fields: fields, Methods: nil})
					}
				}
			}
		}
	}
	fmt.Printf("%d structs found\n", len(structs))
	return structs
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
